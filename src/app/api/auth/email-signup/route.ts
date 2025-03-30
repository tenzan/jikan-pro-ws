import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

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
    
    // Set token expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
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
          password: '', // Empty password indicates incomplete signup
          role: 'ADMIN', // Default role for new users
          signupToken: token,
          signupTokenExpires: expiresAt,
        },
      });
    }

    // In a real application, you would send an email with a link containing the token
    // For example: https://yourdomain.com/complete-signup?token=TOKEN
    
    // For development purposes, log the token
    console.log(`Signup token for ${email}: ${token}`);
    console.log(`Signup link: http://localhost:3000/complete-signup?token=${token}`);

    // Send email using Mailgun
    try {
      const mailgunClient = new Mailgun(formData);
      const domain = process.env.MAILGUN_DOMAIN;
      
      if (!domain || !process.env.MAILGUN_API_KEY) {
        throw new Error('Mailgun configuration is missing');
      }
      
      const mg = mailgunClient.client({ username: 'api', key: process.env.MAILGUN_API_KEY });
      
      // Get the base URL from environment or default to localhost for development
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const signupLink = `${baseUrl}/complete-signup?token=${token}`;
      
      await mg.messages.create(domain, {
        from: `Jikan Pro <noreply@${domain}>`,
        to: [email],
        subject: "Complete your Jikan Pro signup",
        text: `Welcome to Jikan Pro! Click the following link to complete your signup: ${signupLink}\n\nThis link will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Welcome to Jikan Pro!</h2>
            <p>You're just one step away from creating your scheduling page.</p>
            <p>Click the button below to complete your signup:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signupLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete Signup</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `,
      });
      
      console.log(`Signup email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending signup email:', emailError);
      // Continue with the signup process even if email sending fails
      // In production, you might want to handle this differently
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in email signup:', error);
    return NextResponse.json(
      { error: 'Failed to process signup request' },
      { status: 500 }
    );
  }
}
