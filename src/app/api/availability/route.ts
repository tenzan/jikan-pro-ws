import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse, format, addMinutes, isWithinInterval, areIntervalsOverlapping } from "date-fns";

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
    const dateParam = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    
    if (!staffId || !dateParam || !serviceId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Parse the date
    const date = parse(dateParam, "yyyy-MM-dd", new Date());
    
    // Get the service to determine duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Get the business ID from the service
    const businessId = service.businessId;
    
    // If authenticated, verify business access
    if (session?.user?.businessId && session.user.businessId !== businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get staff member to verify they belong to the business
    const staffMember = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staffMember || staffMember.businessId !== businessId) {
      return NextResponse.json(
        { error: "Staff member not found or not associated with this business" },
        { status: 404 }
      );
    }

    // Get working hours for the business
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const workingHours = await prisma.workingHours.findUnique({
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
        staffId,
        status: { not: "CANCELLED" },
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      orderBy: { startTime: "asc" },
    });

    // Generate time slots
    const serviceDuration = service.duration;
    const slots: string[] = [];
    
    let currentSlot = new Date(startTime);
    const businessEndTime = new Date(endTime);
    
    // Subtract service duration from end time to ensure appointments don't go past business hours
    businessEndTime.setMinutes(businessEndTime.getMinutes() - serviceDuration);
    
    while (currentSlot <= businessEndTime) {
      const slotEndTime = addMinutes(currentSlot, serviceDuration);
      
      // Check if this slot overlaps with any existing appointment
      const isOverlapping = existingAppointments.some((appointment: {
        startTime: Date | string;
        endTime: Date | string;
      }) => {
        const appointmentStart = new Date(appointment.startTime);
        const appointmentEnd = new Date(appointment.endTime);
        
        return areIntervalsOverlapping(
          { start: currentSlot, end: slotEndTime },
          { start: appointmentStart, end: appointmentEnd }
        );
      });
      
      if (!isOverlapping) {
        slots.push(format(currentSlot, "HH:mm"));
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
