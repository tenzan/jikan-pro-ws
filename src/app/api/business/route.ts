import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, UserRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/business - Get current user's business
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.businessId) {
      return NextResponse.json(
        { message: "No business found" },
        { status: 404 }
      );
    }

    const business = await prisma.business.findUnique({
      where: {
        id: session.user.businessId,
      },
    });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/business - Create a new business
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has a business
    if (session.user.businessId) {
      return NextResponse.json(
        { message: "User already has a business" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, slug, address, phone, description } = body;

    // Validate input
    if (!name || !slug) {
      return NextResponse.json(
        { message: "Business name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is already in use
    const existingBusiness = await prisma.business.findUnique({
      where: { slug },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { message: "This URL slug is already in use. Please choose another." },
        { status: 400 }
      );
    }

    // Create new business and update user
    const newBusiness = await prisma.$transaction(async (tx: typeof prisma) => {
      // Create the business
      const business = await tx.business.create({
        data: {
          name,
          slug,
          address: address || null,
          phone: phone || null,
          description: description || null,
        },
      });

      // Update the user with the new business ID and set role to OWNER
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          businessId: business.id,
          role: UserRole.OWNER,
        },
      });

      return business;
    });

    return NextResponse.json(newBusiness, { status: 201 });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/business - Update business details
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.businessId) {
      return NextResponse.json(
        { message: "No business found" },
        { status: 404 }
      );
    }

    // Only ADMIN or OWNER can update business
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OWNER) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, phone, description } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { message: "Business name is required" },
        { status: 400 }
      );
    }

    // Update business
    const updatedBusiness = await prisma.business.update({
      where: {
        id: session.user.businessId,
      },
      data: {
        name,
        address: address || null,
        phone: phone || null,
        description: description || null,
      },
    });

    return NextResponse.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
