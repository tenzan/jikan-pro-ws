import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const appointmentSchema = z.object({
  startTime: z.string().datetime(),
  serviceId: z.string(),
  staffId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = appointmentSchema.parse(json);

    // Get service details to calculate end time
    const service = await prisma.service.findUnique({
      where: { id: body.serviceId },
      include: { business: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const startTime = new Date(body.startTime);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Check for overlapping appointments
    const overlapping = await prisma.appointment.findFirst({
      where: {
        staffId: body.staffId,
        status: { not: "CANCELLED" },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
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

    // Create or get customer
    const customer = await prisma.customer.upsert({
      where: { email: body.customerEmail },
      update: {
        name: body.customerName,
        phone: body.customerPhone,
      },
      create: {
        email: body.customerEmail,
        name: body.customerName,
        phone: body.customerPhone,
      },
    });

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        startTime,
        endTime,
        serviceId: body.serviceId,
        staffId: body.staffId,
        customerId: customer.id,
        businessId: service.businessId,
        notes: body.notes,
        status: "PENDING",
      },
      include: {
        service: true,
        staff: true,
        customer: true,
      },
    });

    // TODO: Send confirmation email via Mailgun

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Appointment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

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
      },
      include: {
        service: true,
        staff: true,
        customer: true,
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
