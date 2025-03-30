import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for creating/updating event types
const eventTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  serviceId: z.string().optional(),
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const body = eventTypeSchema.parse(json);

    // Check if the slug is already taken by this user
    const existingEventType = await prisma.eventType.findFirst({
      where: {
        creatorId: session.user.id,
        slug: body.slug,
      },
    });

    if (existingEventType) {
      return NextResponse.json(
        { error: "You already have an event type with this slug" },
        { status: 409 }
      );
    }

    // Create the event type
    const eventType = await prisma.eventType.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        duration: body.duration,
        serviceId: body.serviceId,
        location: body.location,
        color: body.color || "#3788d8",
        isActive: body.isActive ?? true,
        requiresConfirmation: body.requiresConfirmation ?? false,
        minimumNotice: body.minimumNotice ?? 0,
        bufferBefore: body.bufferBefore ?? 0,
        bufferAfter: body.bufferAfter ?? 0,
        customQuestions: body.customQuestions ? JSON.stringify(body.customQuestions) : undefined,
        businessId: session.user.businessId!,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(eventType);
  } catch (error) {
    console.error("Event type creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create event type" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // Allow public access for specific event type lookups
    const slug = searchParams.get("slug");
    const username = searchParams.get("username");
    
    if (slug && username) {
      // Public lookup by username and slug
      const user = await prisma.user.findUnique({
        where: { slug: username },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      const eventType = await prisma.eventType.findFirst({
        where: {
          slug,
          creatorId: user.id,
          isActive: true,
        },
      });
      
      if (!eventType) {
        return NextResponse.json(
          { error: "Event type not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(eventType);
    }
    
    // For listing event types, require authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all event types for the authenticated user
    const eventTypes = await prisma.eventType.findMany({
      where: {
        creatorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json(eventTypes);
  } catch (error) {
    console.error("Event type fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event types" },
      { status: 500 }
    );
  }
}
