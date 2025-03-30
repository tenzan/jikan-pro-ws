import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// This endpoint handles email-based signup requests
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Generate a signup token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Token expires in 10 minutes

    if (existingUser) {
      // If user exists but hasn't completed signup, update their token
      if (!existingUser.password) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            signupToken: token,
            signupTokenExpires: expiresAt,
          },
        });
      }
    } else {
      // Create a new user with a signup token
      await prisma.user.create({
        data: {
          email,
          signupToken: token,
          signupTokenExpires: expiresAt,
          role: 'ADMIN', // Default role for new users
        },
      });
    }

    // In a real application, you would send an email with a link containing the token
    // For example: https://yourdomain.com/complete-signup?token=TOKEN
    
    // For development purposes, log the token
    console.log(`Signup token for ${email}: ${token}`);
    console.log(`Signup link: http://localhost:3000/complete-signup?token=${token}`);

    // In production, you would use a service like Mailgun, SendGrid, etc.
    // Example with Mailgun:
    /*
    const mailgunClient = new Mailgun(formData);
    const domain = process.env.MAILGUN_DOMAIN;
    const mg = mailgunClient.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

    await mg.messages.create(domain, {
      from: "Jikan Pro <noreply@jikanpro.com>",
      to: [email],
      subject: "Complete your Jikan Pro signup",
      text: `Click the following link to complete your signup: http://yourdomain.com/complete-signup?token=${token}`,
      html: `<p>Click the following link to complete your signup: <a href="http://yourdomain.com/complete-signup?token=${token}">Complete Signup</a></p>`,
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in email signup:', error);
    return NextResponse.json(
      { error: 'Failed to process signup request' },
      { status: 500 }
    );
  }
}
