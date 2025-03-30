'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EventType } from '@prisma/client';
import { format, addDays } from 'date-fns';

// Components for the booking flow
import EventTypeCard from '@/components/booking/EventTypeCard';

export default function NewBookingPage() {
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Fetch available event types on component mount
  useEffect(() => {
    async function fetchEventTypes() {
      try {
        // In a real implementation, you would fetch from your API
        // For now, we'll create dummy data
        const dummyEventTypes = [
          {
            id: '1',
            title: '30 Minute Meeting',
            slug: '30min',
            description: 'A quick 30-minute meeting to discuss your needs',
            duration: 30,
            color: '#0ea5e9',
            isActive: true,
            requiresConfirmation: false,
            minimumNotice: 60,
            bufferBefore: 5,
            bufferAfter: 5,
            userId: 'demo-user',
          },
          {
            id: '2',
            title: '60 Minute Consultation',
            slug: '60min',
            description: 'An in-depth 60-minute consultation session',
            duration: 60,
            color: '#8b5cf6',
            isActive: true,
            requiresConfirmation: false,
            minimumNotice: 120,
            bufferBefore: 10,
            bufferAfter: 10,
            userId: 'demo-user',
          }
        ] as EventType[];
        
        setEventTypes(dummyEventTypes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event types:', error);
        setLoading(false);
      }
    }
    
    fetchEventTypes();
  }, []);

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    const daysInMonth = 7; // Just show a week for simplicity
    
    for (let i = 0; i < daysInMonth; i++) {
      const day = addDays(today, i);
      days.push(day);
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">Jikan Pro</Link>
          <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-900">Create your own booking page</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="mt-2 text-lg text-gray-600">Select an event type to get started</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {eventTypes.map((eventType) => (
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
                    href={`/booking/new/${eventType.slug}`}
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

        <div className="mt-16 text-center">
          <div className="inline-block p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {format(selectedDate, 'MMMM yyyy')}
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              <div className="text-xs font-medium text-gray-500">Su</div>
              <div className="text-xs font-medium text-gray-500">Mo</div>
              <div className="text-xs font-medium text-gray-500">Tu</div>
              <div className="text-xs font-medium text-gray-500">We</div>
              <div className="text-xs font-medium text-gray-500">Th</div>
              <div className="text-xs font-medium text-gray-500">Fr</div>
              <div className="text-xs font-medium text-gray-500">Sa</div>
              
              {/* Calendar days */}
              {calendarDays.map((day) => (
                <div 
                  key={day.toISOString()}
                  className={`text-sm py-2 hover:bg-blue-50 rounded cursor-pointer ${
                    day.getDate() === selectedDate.getDate() ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  {day.getDate()}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No registration required</h3>
            <p className="text-gray-600 mb-4">
              Book your appointment without creating an account. You'll have the option to create your own booking page after completing your booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
