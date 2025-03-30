import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BookingCalendar from '@/app/components/booking/BookingCalendar';

interface PageProps {
  params: {
    username: string;
    eventTypeSlug: string;
  };
}

export default async function EventTypeBookingPage({ params }: PageProps) {
  const { username, eventTypeSlug } = params;
  
  // Find the user and event type
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      eventTypes: {
        where: {
          slug: eventTypeSlug,
          isActive: true,
        },
      },
      workingHours: true,
      business: true,
    },
  });

  if (!user || user.eventTypes.length === 0) {
    notFound();
  }

  const eventType = user.eventTypes[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a 
            href={`/booking/${username}`}
            className="text-primary-600 hover:text-primary-700 flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3" 
                style={{ backgroundColor: eventType.color || '#0ea5e9' }}
              />
              <h1 className="text-2xl font-bold text-gray-900">{eventType.title}</h1>
            </div>
            
            <div className="mt-2 flex items-center text-gray-600">
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
              <p className="mt-4 text-gray-600">
                {eventType.description}
              </p>
            )}
          </div>
          
          <BookingCalendar 
            eventType={eventType} 
            user={user} 
            workingHours={user.workingHours} 
          />
        </div>
      </div>
    </div>
  );
}
