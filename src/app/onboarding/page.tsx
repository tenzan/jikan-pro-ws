'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step completed, redirect to dashboard
      router.push('/dashboard');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Jikan Pro</h1>
          <p className="mt-2 text-lg text-gray-600">Let's set up your scheduling page</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div 
                    className={`w-20 h-1 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-4">
            <span className="text-sm text-gray-600">Basic Info</span>
            <span className="text-sm text-gray-600">Availability</span>
            <span className="text-sm text-gray-600">Event Types</span>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tell us about yourself</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                    Your timezone
                  </label>
                  <select
                    id="timezone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="Asia/Tokyo"
                  >
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8)</option>
                    <option value="America/Los_Angeles">Pacific Time (GMT-7)</option>
                    <option value="America/New_York">Eastern Time (GMT-4)</option>
                    <option value="Europe/London">London (GMT+1)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio (optional)
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell your clients a bit about yourself..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Set your availability</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={day} className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">{day}</div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          defaultChecked={index !== 0 && index !== 6} // Weekdays checked by default
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start time
                    </label>
                    <select
                      id="startTime"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="09:00"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i < 12 ? `${i === 0 ? 12 : i}:00 AM` : `${i === 12 ? 12 : i - 12}:00 PM`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End time
                    </label>
                    <select
                      id="endTime"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="17:00"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i < 12 ? `${i === 0 ? 12 : i}:00 AM` : `${i === 12 ? 12 : i - 12}:00 PM`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create your event types</h2>
              <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">30 Minute Meeting</h3>
                      <p className="text-sm text-gray-600 mt-1">A quick 30-minute meeting to discuss your needs</p>
                    </div>
                    <div className="text-sm text-gray-500">30 min</div>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-3 h-3 rounded-full bg-purple-600 mt-1.5 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">60 Minute Consultation</h3>
                      <p className="text-sm text-gray-600 mt-1">An in-depth 60-minute consultation session</p>
                    </div>
                    <div className="text-sm text-gray-500">60 min</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add new event type
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200"
            >
              Back
            </button>
          ) : (
            <div></div> // Empty div to maintain layout
          )}
          <button
            type="button"
            onClick={handleContinue}
            className="px-6 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200"
          >
            {currentStep === 3 ? 'Finish' : 'Continue'}
          </button>
        </div>

        {/* Skip link */}
        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
