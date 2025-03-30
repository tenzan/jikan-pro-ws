import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { token, name, businessName, password } = await request.json();

    if (!token || !name || !businessName || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find user with this token in the database
    const user = await prisma.user.findFirst({
      where: {
        // Using Prisma's type-safe approach for custom fields
        // @ts-ignore - signupToken is added to the schema but TypeScript doesn't recognize it yet
        signupToken: token,
        // @ts-ignore - signupTokenExpires is added to the schema but TypeScript doesn't recognize it yet
        signupTokenExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a business for the user
    const business = await prisma.business.create({
      data: {
        name: businessName,
        slug: businessName.toLowerCase().replace(/\s+/g, '-'), // Required field
        bufferBefore: 0,
        bufferAfter: 0,
      },
    });

    // Generate a slug from the name (lowercase, no spaces)
    const slug = name.toLowerCase().replace(/\s+/g, '');

    // Update the user with the provided information
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        password: hashedPassword,
        businessId: business.id,
        slug, // Use slug instead of username
        // @ts-ignore - signupToken is added to the schema but TypeScript doesn't recognize it yet
        signupToken: null, // Clear the token
        // @ts-ignore - signupTokenExpires is added to the schema but TypeScript doesn't recognize it yet
        signupTokenExpires: null, // Clear the expiration
      },
    });

    // Create default working hours for the user
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    
    for (const dayOfWeek of daysOfWeek) {
      await prisma.workingHours.create({
        data: {
          businessId: business.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isEnabled: dayOfWeek !== 0 && dayOfWeek !== 6, // Disable weekends
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing signup:', error);
    return NextResponse.json(
      { error: 'Failed to complete signup' },
      { status: 500 }
    );
  }
}
