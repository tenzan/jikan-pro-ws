import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for updating event types
const eventTypeUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
  serviceId: z.string().optional().nullable(),
  location: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  requiresConfirmation: z.boolean().optional(),
  minimumNotice: z.number().min(0).optional(),
  bufferBefore: z.number().min(0).optional(),
  bufferAfter: z.number().min(0).optional(),
  customQuestions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(["text", "textarea", "select"]),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional(),
    })
  ).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Get the event type
    const eventType = await prisma.eventType.findUnique({
      where: { id },
      include: {
        service: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    // For non-public event types, check authorization
    if (!eventType.isActive) {
      if (!session?.user || (session.user.id !== eventType.creatorId && session.user.role !== "ADMIN")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(eventType);
  } catch (error) {
    console.error("Event type fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event type" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if the event type exists and belongs to the user
    const existingEventType = await prisma.eventType.findUnique({
      where: { id },
    });

    if (!existingEventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to update this event type
    if (existingEventType.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to update this event type" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const body = eventTypeUpdateSchema.parse(json);

    // If slug is being updated, check if it's already taken
    if (body.slug && body.slug !== existingEventType.slug) {
      const slugExists = await prisma.eventType.findFirst({
        where: {
          creatorId: session.user.id,
          slug: body.slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "You already have an event type with this slug" },
          { status: 409 }
        );
      }
    }

    // Update the event type
    const updateData: any = { ...body };
    
    // Handle custom questions separately
    if (body.customQuestions) {
      updateData.customQuestions = JSON.stringify(body.customQuestions);
    }

    const updatedEventType = await prisma.eventType.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
      },
    });

    return NextResponse.json(updatedEventType);
  } catch (error) {
    console.error("Event type update error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update event type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if the event type exists and belongs to the user
    const existingEventType = await prisma.eventType.findUnique({
      where: { id },
    });

    if (!existingEventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to delete this event type
    if (existingEventType.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to delete this event type" },
        { status: 403 }
      );
    }

    // Check if there are any future appointments using this event type
    const futureAppointments = await prisma.appointment.findFirst({
      where: {
        eventTypeId: id,
        startTime: { gte: new Date() },
        status: { not: "CANCELLED" },
      },
    });

    if (futureAppointments) {
      return NextResponse.json(
        { error: "Cannot delete event type with future appointments" },
        { status: 409 }
      );
    }

    // Delete the event type
    await prisma.eventType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event type deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete event type" },
      { status: 500 }
    );
  }
}
