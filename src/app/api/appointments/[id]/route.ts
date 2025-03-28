import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateAppointmentSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const body = updateAppointmentSchema.parse(json);

    const { id } = context.params;
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify business access
    if (appointment.businessId !== session.user.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: body.status,
        ...(body.notes && { notes: body.notes }),
      },
      include: {
        service: true,
        staff: true,
        customer: true,
      },
    });

    // TODO: Send email notification based on status change

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Appointment update error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = context.params;
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify business access
    if (appointment.businessId !== session.user.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Delete the appointment (or mark as cancelled)
    // For audit purposes, it's often better to mark as cancelled rather than delete
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Appointment deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
