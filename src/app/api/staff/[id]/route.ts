import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, UserRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

// GET /api/staff/[id] - Get a specific staff member
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
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
        id: context.params.id,
        businessId: session.user.businessId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/staff/[id] - Update a staff member
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
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

    // Only ADMIN or OWNER can update staff
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OWNER) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, role, newPassword } = body;

    // Validate input
    if (!name || !email || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if staff member exists and belongs to the business
    const existingStaff = await prisma.user.findUnique({
      where: {
        id: context.params.id,
        businessId: session.user.businessId,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { message: "Staff member not found" },
        { status: 404 }
      );
    }

    // Check if email is already in use by another user
    if (email !== existingStaff.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      });

      if (emailInUse) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
    };

    // If new password is provided, hash it
    if (newPassword) {
      updateData.password = await hash(newPassword, 10);
    }

    // Update staff member
    const updatedStaff = await prisma.user.update({
      where: {
        id: context.params.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error("Error updating staff member:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/[id] - Delete a staff member
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
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

    // Only ADMIN or OWNER can delete staff
    if (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.OWNER) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if staff member exists and belongs to the business
    const existingStaff = await prisma.user.findUnique({
      where: {
        id: context.params.id,
        businessId: session.user.businessId,
      },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { message: "Staff member not found" },
        { status: 404 }
      );
    }

    // Check if this is the last owner
    if (existingStaff.role === UserRole.OWNER) {
      const ownerCount = await prisma.user.count({
        where: {
          businessId: session.user.businessId,
          role: UserRole.OWNER,
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          { message: "Cannot delete the last owner of the business" },
          { status: 400 }
        );
      }
    }

    // Delete staff member
    await prisma.user.delete({
      where: {
        id: context.params.id,
      },
    });

    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
