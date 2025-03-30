import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import EventTypeCard from '@/app/components/booking/EventTypeCard';

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UserBookingPage({ params }: PageProps) {
  const { username } = params;
  
  // Find the user by username
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      eventTypes: {
        where: {
          isActive: true,
        },
        orderBy: {
          duration: 'asc',
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name || ''} 
                className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto bg-primary-500 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md">
                {user.name?.charAt(0) || username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">{user.name}</h1>
          {user.business && (
            <p className="mt-2 text-lg text-gray-600">{user.business.name}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {user.eventTypes.map((eventType) => (
            <EventTypeCard 
              key={eventType.id} 
              eventType={eventType} 
              username={username}
            />
          ))}
        </div>

        {user.eventTypes.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium text-gray-700">No event types available</h2>
            <p className="mt-2 text-gray-500">This user has not set up any event types yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
