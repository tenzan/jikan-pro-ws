import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { generateUniqueBusinessSlug } from '@/utils/slug';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name, businessName } = await request.json();

    // Validate input
    if (!email || !password || !name || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate unique business slug from name
    const businessSlug = await generateUniqueBusinessSlug(businessName);

    // Create user and business in a transaction
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Create business first
      const business = await tx.business.create({
        data: {
          name: businessName,
          slug: businessSlug,
          description: null,
          address: null,
          phone: null,
        },
      });

      // Then create user with reference to the business
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'OWNER',
          businessId: business.id, // Link user to business
        },
      });

      // Update business with owner reference
      await tx.business.update({
        where: { id: business.id },
        data: { ownerId: user.id },
      });

      return { user, business };
    });

    const { user, business } = result;

    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      business
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
