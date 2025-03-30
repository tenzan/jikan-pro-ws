import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

// This page automatically redirects to a demo user's booking page
export default async function DemoPage() {
  // Find or create a demo user
  let demoUser = await prisma.user.findFirst({
    where: {
      email: 'demo@jikanpro.com',
    },
  });

  if (!demoUser) {
    // Create a demo business
    const demoBusiness = await prisma.business.create({
      data: {
        name: 'Jikan Pro Demo',
        timezone: 'UTC',
        bufferBefore: 0,
        bufferAfter: 0,
      },
    });

    // Create a demo user
    demoUser = await prisma.user.create({
      data: {
        name: 'Demo Account',
        email: 'demo@jikanpro.com',
        password: '', // No password needed as this is just a demo account
        role: 'ADMIN',
        username: 'demo',
        businessId: demoBusiness.id,
      },
    });

    // Create default working hours for the demo user
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    
    for (const dayOfWeek of daysOfWeek) {
      await prisma.workingHours.create({
        data: {
          userId: demoUser.id,
          businessId: demoBusiness.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isEnabled: dayOfWeek !== 0 && dayOfWeek !== 6, // Disable weekends
        },
      });
    }

    // Create demo event types
    await prisma.eventType.create({
      data: {
        title: '30 Minute Meeting',
        slug: '30min',
        description: 'A quick 30-minute meeting to discuss your needs',
        duration: 30,
        color: '#0ea5e9',
        isActive: true,
        requiresConfirmation: false,
        minimumNotice: 60, // 1 hour minimum notice
        bufferBefore: 5,
        bufferAfter: 5,
        userId: demoUser.id,
      },
    });

    await prisma.eventType.create({
      data: {
        title: '60 Minute Consultation',
        slug: '60min',
        description: 'An in-depth 60-minute consultation session',
        duration: 60,
        color: '#8b5cf6',
        isActive: true,
        requiresConfirmation: false,
        minimumNotice: 120, // 2 hours minimum notice
        bufferBefore: 10,
        bufferAfter: 10,
        userId: demoUser.id,
        customQuestions: JSON.stringify([
          {
            id: 'topic',
            type: 'text',
            label: 'What topics would you like to discuss?',
            required: true,
          },
          {
            id: 'preparation',
            type: 'textarea',
            label: 'Is there anything you\'d like me to prepare for our meeting?',
            required: false,
          }
        ]),
      },
    });
  }

  // Redirect to the demo user's booking page
  redirect(`/booking/demo`);
}
