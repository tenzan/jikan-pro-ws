'use client';

import { useState } from 'react';
import { EventType, User } from '@prisma/client';
import { format, parseISO } from 'date-fns';

interface BookingFormProps {
  eventType: EventType;
  user: User & {
    business: any;
  };
  date: string;
  time: string;
  onBack: () => void;
}

interface CustomQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  required: boolean;
  options?: string[];
}

export default function BookingForm({ eventType, user, date, time, onBack }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [customResponses, setCustomResponses] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse custom questions if they exist
  const customQuestions: CustomQuestion[] = eventType.customQuestions 
    ? JSON.parse(eventType.customQuestions) 
    : [];

  // Format the date and time for display
  const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
  const formattedTime = (() => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  })();

  // Handle custom question responses
  const handleCustomResponse = (questionId: string, value: string | string[]) => {
    setCustomResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventTypeId: eventType.id,
          userId: user.id,
          date,
          time,
          name,
          email,
          notes,
          customResponses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while booking your appointment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          You've scheduled a {eventType.duration} minute {eventType.title} with {user.name}.
        </p>
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-start mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-500 mr-3 mt-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <div>
              <p className="font-medium text-gray-900">{formattedDate}</p>
              <p className="text-gray-600">{formattedTime}</p>
            </div>
          </div>
          
          {eventType.location && (
            <div className="flex items-start">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-500 mr-3 mt-1" 
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
              <p className="text-gray-600">{eventType.location}</p>
            </div>
          )}
        </div>
        <p className="mt-6 text-gray-500">
          A calendar invitation has been sent to your email.
        </p>
        <a 
          href={`/booking/${user.username}`}
          className="mt-6 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          Book another appointment
        </a>
      </div>
    );
  }

  return (
    <div className="booking-form">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 flex items-center"
          disabled={loading}
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
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-3" 
            style={{ backgroundColor: eventType.color || '#0ea5e9' }}
          />
          <h2 className="text-lg font-medium text-gray-900">{eventType.title}</h2>
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
        <div className="mt-3 flex items-start">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-500 mr-2 mt-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <div>
            <p className="font-medium text-gray-900">{formattedDate}</p>
            <p className="text-gray-600">{formattedTime}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Your name"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {customQuestions.map((question) => (
            <div key={question.id}>
              <label 
                htmlFor={`question-${question.id}`} 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {question.label} {question.required && '*'}
              </label>
              
              {question.type === 'text' && (
                <input
                  type="text"
                  id={`question-${question.id}`}
                  value={(customResponses[question.id] as string) || ''}
                  onChange={(e) => handleCustomResponse(question.id, e.target.value)}
                  required={question.required}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={loading}
                />
              )}
              
              {question.type === 'textarea' && (
                <textarea
                  id={`question-${question.id}`}
                  value={(customResponses[question.id] as string) || ''}
                  onChange={(e) => handleCustomResponse(question.id, e.target.value)}
                  required={question.required}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  disabled={loading}
                />
              )}
              
              {question.type === 'select' && question.options && (
                <select
                  id={`question-${question.id}`}
                  value={(customResponses[question.id] as string) || ''}
                  onChange={(e) => handleCustomResponse(question.id, e.target.value)}
                  required={question.required}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={loading}
                >
                  <option value="">Select an option</option>
                  {question.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              
              {question.type === 'radio' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`question-${question.id}-${index}`}
                        name={`question-${question.id}`}
                        value={option}
                        checked={(customResponses[question.id] as string) === option}
                        onChange={(e) => handleCustomResponse(question.id, e.target.value)}
                        required={question.required}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        disabled={loading}
                      />
                      <label 
                        htmlFor={`question-${question.id}-${index}`} 
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {question.type === 'checkbox' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`question-${question.id}-${index}`}
                        value={option}
                        checked={Array.isArray(customResponses[question.id]) && 
                          (customResponses[question.id] as string[]).includes(option)}
                        onChange={(e) => {
                          const currentValues = Array.isArray(customResponses[question.id]) 
                            ? [...customResponses[question.id] as string[]] 
                            : [];
                          
                          if (e.target.checked) {
                            handleCustomResponse(question.id, [...currentValues, option]);
                          } else {
                            handleCustomResponse(
                              question.id,
                              currentValues.filter(val => val !== option)
                            );
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <label 
                        htmlFor={`question-${question.id}-${index}`} 
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Any additional information you'd like to share"
              disabled={loading}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
