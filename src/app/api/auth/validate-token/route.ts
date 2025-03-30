import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        signupToken: token,
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

    return NextResponse.json({
      valid: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
