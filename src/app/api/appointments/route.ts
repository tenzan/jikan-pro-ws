import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { addMinutes } from "date-fns";

import { prisma } from '@/lib/prisma';

// Updated schema to support event types and timezone
const appointmentSchema = z.object({
  startTime: z.string().datetime(),
  staffId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  timezone: z.string().optional(),
  // Make serviceId optional if eventTypeId is provided
  serviceId: z.string().optional(),
  // Add eventTypeId for Calendly-like booking
  eventTypeId: z.string().optional(),
  // Add responses for custom questions
  responses: z.record(z.string(), z.string()).optional(),
}).refine(data => data.serviceId || data.eventTypeId, {
  message: "Either serviceId or eventTypeId must be provided",
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = appointmentSchema.parse(json);

    // Determine if we're booking via event type or directly via service
    let service;
    let eventType;
    let duration;
    let businessId;
    let status = "PENDING";
    let bufferBefore = 0;
    let bufferAfter = 0;
    
    if (body.eventTypeId) {
      // Get event type details
      eventType = await prisma.eventType.findUnique({
        where: { id: body.eventTypeId },
        include: { 
          service: true,
          business: true,
        },
      });

      if (!eventType) {
        return NextResponse.json(
          { error: "Event type not found" },
          { status: 404 }
        );
      }
      
      // If event type requires confirmation, set status accordingly
      if (eventType.requiresConfirmation) {
        status = "PENDING";
      } else {
        status = "CONFIRMED";
      }
      
      // Get service from event type if available
      service = eventType.service;
      duration = eventType.duration;
      businessId = eventType.businessId;
      bufferBefore = eventType.bufferBefore;
      bufferAfter = eventType.bufferAfter;
      
      // If event type doesn't have a service, we need to create the appointment without a service
      if (!service && !body.serviceId) {
        // We'll handle this case below
      } else if (body.serviceId) {
        // If serviceId is explicitly provided, use that instead
        service = await prisma.service.findUnique({
          where: { id: body.serviceId },
        });
        
        if (!service) {
          return NextResponse.json(
            { error: "Service not found" },
            { status: 404 }
          );
        }
      }
    } else if (body.serviceId) {
      // Traditional booking via service
      service = await prisma.service.findUnique({
        where: { id: body.serviceId },
        include: { business: true },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }
      
      duration = service.duration;
      businessId = service.businessId;
      
      // Get buffer times from business
      if (service.business) {
        bufferBefore = service.business.bufferBefore;
        bufferAfter = service.business.bufferAfter;
      }
    } else {
      return NextResponse.json(
        { error: "Either serviceId or eventTypeId must be provided" },
        { status: 400 }
      );
    }

    // Calculate start and end times
    const startTime = new Date(body.startTime);
    const endTime = addMinutes(startTime, duration);

    // Check for overlapping appointments, including buffer times
    const bufferStart = addMinutes(startTime, -bufferBefore);
    const bufferEnd = addMinutes(endTime, bufferAfter);
    
    const overlapping = await prisma.appointment.findFirst({
      where: {
        staffId: body.staffId,
        status: { not: "CANCELLED" },
        OR: [
          {
            AND: [
              { startTime: { lte: bufferStart } },
              { endTime: { gt: bufferStart } },
            ],
          },
          {
            AND: [
              { startTime: { lt: bufferEnd } },
              { endTime: { gte: bufferEnd } },
            ],
          },
          {
            AND: [
              { startTime: { gte: bufferStart } },
              { endTime: { lte: bufferEnd } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Time slot is not available" },
        { status: 409 }
      );
    }

    // Find existing customer by email or create a new one
    let customer = await prisma.customer.findFirst({
      where: { email: body.customerEmail }
    });
    
    if (!customer) {
      // Create new customer if not found
      customer = await prisma.customer.create({
        data: {
          email: body.customerEmail,
          name: body.customerName,
          phone: body.customerPhone,
          timezone: body.timezone,
        },
      });
    } else {
      // Update existing customer
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: body.customerName,
          phone: body.customerPhone,
          timezone: body.timezone || customer.timezone,
        },
      });
    }

    // Create appointment
    const appointmentData: any = {
      startTime,
      endTime,
      staffId: body.staffId,
      customerId: customer.id,
      businessId,
      notes: body.notes,
      status,
      timezone: body.timezone,
      responses: body.responses ? JSON.stringify(body.responses) : null,
    };
    
    // Add serviceId if available
    if (service) {
      appointmentData.serviceId = service.id;
    }
    
    // Add eventTypeId if available
    if (eventType) {
      appointmentData.eventTypeId = eventType.id;
    }
    
    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        service: true,
        staff: true,
        customer: true,
        eventType: true,
      },
    });

    // TODO: Send confirmation email via Mailgun
    // This would be a good place to send confirmation emails
    // We could use the eventType.requiresConfirmation to determine if we should
    // send a "pending confirmation" email or a "confirmed" email

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Appointment creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // Allow public access for specific appointment lookups by ID
    const appointmentId = searchParams.get("id");
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          service: true,
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              bio: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          eventType: true,
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              phone: true,
            },
          },
        },
      });
      
      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(appointment);
    }
    
    // For listing appointments, require authentication
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const staffId = searchParams.get("staffId");

    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: session.user.businessId,
        ...(startDate && {
          startTime: { gte: new Date(startDate) },
        }),
        ...(endDate && {
          endTime: { lte: new Date(endDate) },
        }),
        ...(status && {
          status: status as any,
        }),
        ...(staffId && {
          staffId,
        }),
      },
      include: {
        service: true,
        staff: true,
        customer: true,
        eventType: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Appointment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
