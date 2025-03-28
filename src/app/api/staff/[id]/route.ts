import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, UserRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

// GET /api/staff/[id] - Get a specific staff member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { message: "No business context found" },
        { status: 400 }
      );
    }

    const staffMember = await prisma.user.findUnique({
      where: {
        id: params.id,
        businessId: session.user.businessId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        services: true,
        appointments: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 5,
          include: {
            customer: true,
            service: true,
          },
        },
      },
    });

    if (!staffMember) {
      return NextResponse.json(
        { message: "Staff member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(staffMember);
  } catch (error) {
    console.error("Error fetching staff member:", error);
    return NextResponse.json(
      { message: "Error fetching staff member" },
      { status: 500 }
    );
  }
}

// PATCH /api/staff/[id] - Update a staff member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== UserRole.OWNER && session.user.id !== params.id) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    if (!session.user.businessId) {
      return NextResponse.json(
        { message: "No business context found" },
        { status: 400 }
      );
    }

    const staffMember = await prisma.user.findUnique({
      where: {
        id: params.id,
        businessId: session.user.businessId,
      },
    });

    if (!staffMember) {
      return NextResponse.json(
        { message: "Staff member not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Only allow updating certain fields
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.bio !== undefined) updateData.bio = body.bio;
    
    // Only owners can change roles
    if (body.role && session.user.role === UserRole.OWNER) {
      updateData.role = body.role;
    }
    
    // Handle password update separately
    if (body.password) {
      updateData.password = await hash(body.password, 10);
    }

    const updatedStaffMember = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
      },
    });

    return NextResponse.json(updatedStaffMember);
  } catch (error) {
    console.error("Error updating staff member:", error);
    return NextResponse.json(
      { message: "Error updating staff member" },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.OWNER) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.businessId) {
      return NextResponse.json(
        { message: "No business context found" },
        { status: 400 }
      );
    }

    const staffMember = await prisma.user.findUnique({
      where: {
        id: params.id,
        businessId: session.user.businessId,
      },
    });

    if (!staffMember) {
      return NextResponse.json(
        { message: "Staff member not found" },
        { status: 404 }
      );
    }

    // Check if the user is trying to delete themselves
    if (session.user.id === params.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete the staff member
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    return NextResponse.json(
      { message: "Error deleting staff member" },
      { status: 500 }
    );
  }
}
