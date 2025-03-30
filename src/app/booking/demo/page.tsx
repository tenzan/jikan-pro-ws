import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';

// This page shows a Calendly-like booking interface
export default async function DemoPage() {
  // Find or create a demo user
  let demoUser = await prisma.user.findFirst({
    where: {
      email: 'demo@jikanpro.com',
    },
    include: {
      business: true,
      eventTypes: true
    }
  });

  if (!demoUser) {
    // Create a demo business
    const demoBusiness = await prisma.business.create({
      data: {
        name: 'Jikan Pro Demo',
        slug: 'jikan-pro-demo',
      },
    });

    // Create a demo user
    demoUser = await prisma.user.create({
      data: {
        name: 'Demo Account',
        email: 'demo@jikanpro.com',
        password: '', // No password needed as this is just a demo account
        role: 'ADMIN',
        slug: 'demo',
        timezone: 'UTC',
        businessId: demoBusiness.id,
      },
      include: {
        business: true,
        eventTypes: true
      }
    });

    // Create default working hours for the demo user
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    
    for (const dayOfWeek of daysOfWeek) {
      await prisma.workingHours.create({
        data: {
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
        creatorId: demoUser.id,
        businessId: demoBusiness.id,
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
        creatorId: demoUser.id,
        businessId: demoBusiness.id,
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

    // Refetch user with the newly created event types
    demoUser = await prisma.user.findUnique({
      where: {
        id: demoUser.id
      },
      include: {
        business: true,
        eventTypes: true
      }
    });

    if (!demoUser) {
      throw new Error('Failed to create demo user');
    }
  }

  // Display a Calendly-like booking interface
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">Jikan Pro</Link>
          <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-900">Create your own scheduling page</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full mx-auto bg-blue-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md">
              {demoUser.name?.charAt(0) || 'D'}
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">{demoUser.name}</h1>
          {demoUser.business && (
            <p className="mt-2 text-lg text-gray-600">{demoUser.business.name}</p>
          )}
        </div>

        <h2 className="text-xl font-medium text-gray-800 mb-6">Select an event type</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {demoUser.eventTypes.map((eventType: any) => (
            <div key={eventType.id} className="block group">
              <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
                <div 
                  className="w-3 h-3 rounded-full mb-4" 
                  style={{ backgroundColor: eventType.color || '#0ea5e9' }}
                />
                
                <h3 className="text-xl font-medium text-gray-900 group-hover:text-blue-600">
                  {eventType.title}
                </h3>
                
                <div className="mt-2 text-gray-500 flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <span>{eventType.duration} minutes</span>
                </div>
                
                {eventType.description && (
                  <p className="mt-4 text-gray-600 text-sm flex-grow">
                    {eventType.description}
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <Link 
                    href={`/booking/${demoUser.slug}/${eventType.slug}`}
                    className="text-blue-600 font-medium hover:text-blue-700 flex items-center"
                  >
                    Book
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {demoUser.eventTypes.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium text-gray-700">No event types available</h2>
            <p className="mt-2 text-gray-500">This user has not set up any event types yet.</p>
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="inline-block p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">April 2025</h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              <div className="text-xs font-medium text-gray-500">Su</div>
              <div className="text-xs font-medium text-gray-500">Mo</div>
              <div className="text-xs font-medium text-gray-500">Tu</div>
              <div className="text-xs font-medium text-gray-500">We</div>
              <div className="text-xs font-medium text-gray-500">Th</div>
              <div className="text-xs font-medium text-gray-500">Fr</div>
              <div className="text-xs font-medium text-gray-500">Sa</div>
              
              {/* Calendar days */}
              <div className="text-sm text-gray-400 py-2">28</div>
              <div className="text-sm text-gray-400 py-2">29</div>
              <div className="text-sm text-gray-400 py-2">30</div>
              <div className="text-sm text-gray-900 py-2 hover:bg-blue-50 rounded cursor-pointer">1</div>
              <div className="text-sm text-gray-900 py-2 hover:bg-blue-50 rounded cursor-pointer">2</div>
              <div className="text-sm text-gray-900 py-2 hover:bg-blue-50 rounded cursor-pointer">3</div>
              <div className="text-sm text-gray-900 py-2 hover:bg-blue-50 rounded cursor-pointer">4</div>
              {/* More days would go here */}
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Want your own scheduling page?</h3>
            <p className="text-gray-600 mb-4">
              Create your free Jikan Pro account to manage your schedule, customize your availability, and share your booking page with others.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
