import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parse, format, addMinutes, subMinutes, isWithinInterval, areIntervalsOverlapping } from "date-fns";

// Define working hours (9 AM to 5 PM by default)
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 17;
const DEFAULT_SLOT_DURATION = 30; // minutes

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow both authenticated and unauthenticated access
    // For public booking, we don't require authentication
    // For admin dashboard, we check business access
    
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get("staffId");
    const userId = searchParams.get("userId"); // Support for userId parameter
    const dateParam = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const eventTypeId = searchParams.get("eventTypeId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    
    // Either staffId or userId is required
    if ((!staffId && !userId) || !dateParam) {
      return NextResponse.json(
        { error: "Missing required parameters: need either staffId or userId, and date" },
        { status: 400 }
      );
    }
    
    // Use userId if staffId is not provided
    const userIdentifier = staffId || userId;

    // Parse the date
    const date = parse(dateParam, "yyyy-MM-dd", new Date());
    
    // Get the user with their business and working hours
    const user = await prisma.user.findUnique({
      where: { id: userIdentifier },
      include: { 
        business: true,
        workingHours: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const businessId = user.businessId;
    
    if (!businessId) {
      return NextResponse.json(
        { error: "User is not associated with a business" },
        { status: 400 }
      );
    }
    
    // If authenticated and accessing admin features, verify business access
    if (session?.user?.businessId && 
        session.user.businessId !== businessId && 
        searchParams.get("admin") === "true") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Determine duration and buffer times
    let duration = DEFAULT_SLOT_DURATION;
    let bufferBefore = 0;
    let bufferAfter = 0;
    
    // If event type is provided, use its settings
    if (eventTypeId) {
      const eventType = await prisma.eventType.findUnique({
        where: { id: eventTypeId },
      });
      
      if (eventType) {
        duration = eventType.duration;
        bufferBefore = eventType.bufferBefore;
        bufferAfter = eventType.bufferAfter;
      }
    } 
    // Otherwise, if service is provided, use its duration
    else if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      
      if (service) {
        duration = service.duration;
      }
      
      // Use business default buffer times
      if (staffMember.business) {
        bufferBefore = staffMember.business.bufferBefore;
        bufferAfter = staffMember.business.bufferAfter;
      }
    }

    // Get working hours for the user on the specific day
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // First check if user has specific working hours
    const userWorkingHours = user.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    
    // If user doesn't have specific working hours, check business default
    const workingHours = userWorkingHours || await prisma.workingHours.findUnique({
      where: {
        businessId_dayOfWeek: {
          businessId,
          dayOfWeek,
        },
      },
    });

    // If no working hours defined or not enabled, return empty slots
    if (!workingHours || !workingHours.isEnabled) {
      return NextResponse.json({ availableSlots: [] });
    }

    // Parse working hours
    const startTime = parse(workingHours.startTime, "HH:mm", date);
    const endTime = parse(workingHours.endTime, "HH:mm", date);

    // Get existing appointments for the staff member on the selected date
    const startDate = startDateParam ? new Date(startDateParam) : new Date(date.setHours(0, 0, 0, 0));
    const endDate = endDateParam ? new Date(endDateParam) : new Date(date.setHours(23, 59, 59, 999));

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        staffId: userIdentifier,
        status: { not: "CANCELLED" },
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      orderBy: { startTime: "asc" },
    });

    // Generate time slots
    const slots: string[] = [];
    
    let currentSlot = new Date(startTime);
    const businessEndTime = new Date(endTime);
    
    // Subtract total time (duration + buffer after) from end time to ensure appointments don't go past business hours
    businessEndTime.setMinutes(businessEndTime.getMinutes() - (duration + bufferAfter));
    
    // Calculate the minimum booking time based on current time + minimum notice
    const now = new Date();
    let minimumBookingTime = now;
    
    // If event type has minimum notice, apply it
    if (eventTypeId) {
      const eventType = await prisma.eventType.findUnique({
        where: { id: eventTypeId },
      });
      
      if (eventType && eventType.minimumNotice > 0) {
        minimumBookingTime = addMinutes(now, eventType.minimumNotice);
      }
    }
    
    while (currentSlot <= businessEndTime) {
      // Apply buffer before
      const actualStartTime = bufferBefore > 0 ? addMinutes(currentSlot, bufferBefore) : currentSlot;
      
      // Calculate end time including the appointment duration
      const actualEndTime = addMinutes(actualStartTime, duration);
      
      // Apply buffer after
      const slotEndWithBuffer = bufferAfter > 0 ? addMinutes(actualEndTime, bufferAfter) : actualEndTime;
      
      // Check if this slot is in the future and respects minimum notice
      const isInFuture = actualStartTime > minimumBookingTime;
      
      // Skip slots that are in the past or don't respect minimum notice
      if (!isInFuture) {
        currentSlot = addMinutes(currentSlot, DEFAULT_SLOT_DURATION);
        continue;
      }
      
      // Check if this slot overlaps with any existing appointment (including buffers)
      const isOverlapping = existingAppointments.some((appointment: {
        startTime: Date | string;
        endTime: Date | string;
      }) => {
        const appointmentStart = new Date(appointment.startTime);
        // Consider buffer before for existing appointments
        const appointmentStartWithBuffer = bufferBefore > 0 
          ? subMinutes(appointmentStart, bufferBefore) 
          : appointmentStart;
        
        const appointmentEnd = new Date(appointment.endTime);
        // Consider buffer after for existing appointments
        const appointmentEndWithBuffer = bufferAfter > 0 
          ? addMinutes(appointmentEnd, bufferAfter) 
          : appointmentEnd;
        
        return areIntervalsOverlapping(
          { start: currentSlot, end: slotEndWithBuffer },
          { start: appointmentStartWithBuffer, end: appointmentEndWithBuffer }
        );
      });
      
      if (!isOverlapping) {
        // Only add the actual start time (without buffer before) to the available slots
        slots.push(format(actualStartTime, "HH:mm"));
      }
      
      // Move to next slot (30-minute increments by default)
      currentSlot = addMinutes(currentSlot, DEFAULT_SLOT_DURATION);
    }
    
    return NextResponse.json({ availableSlots: slots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
