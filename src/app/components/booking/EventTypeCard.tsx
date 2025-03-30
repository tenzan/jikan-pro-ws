import Link from 'next/link';
import { EventType } from '@prisma/client';

interface EventTypeCardProps {
  eventType: EventType;
  username: string;
}

export default function EventTypeCard({ eventType, username }: EventTypeCardProps) {
  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`;
  };

  return (
    <Link 
      href={`/booking/${username}/${eventType.slug}`}
      className="block group"
    >
      <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <div 
          className="w-3 h-3 rounded-full mb-4" 
          style={{ backgroundColor: eventType.color || '#0ea5e9' }}
        />
        
        <h3 className="text-xl font-medium text-gray-900 group-hover:text-primary-600">
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
          <span>{formatDuration(eventType.duration)}</span>
        </div>
        
        {eventType.description && (
          <p className="mt-4 text-gray-600 text-sm flex-grow">
            {eventType.description}
          </p>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-primary-600 font-medium group-hover:text-primary-700 flex items-center">
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
          </span>
          
          {eventType.location && (
            <div className="text-gray-500 text-sm flex items-center">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              {eventType.location}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
