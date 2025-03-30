'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';

interface BookingTimeSlotsProps {
  date: string;
  availableSlots: string[];
  onSlotSelect: (slot: string) => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function BookingTimeSlots({
  date,
  availableSlots,
  onSlotSelect,
  onBack,
  loading,
  error
}: BookingTimeSlotsProps) {
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Format the date for display
  const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

  // Group time slots by morning, afternoon, and evening
  const groupedSlots = availableSlots.reduce(
    (groups: { morning: string[]; afternoon: string[]; evening: string[] }, slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      
      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 17) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
      
      return groups;
    },
    { morning: [], afternoon: [], evening: [] }
  );

  // Format time for display (e.g., "09:00" to "9:00 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="time-slots-container">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
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
        </button>
        
        <div className="text-right">
          <select
            value={selectedTimeZone}
            onChange={(e) => setSelectedTimeZone(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="America/New_York">New York (EST/EDT)</option>
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Europe/Paris">Paris (CET/CEST)</option>
            <option value="Asia/Singapore">Singapore (SGT)</option>
          </select>
        </div>
      </div>

      <h2 className="text-xl font-medium text-gray-900 mb-4">{formattedDate}</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No available time slots for this date.</p>
          <button
            onClick={onBack}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Select another date
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedSlots.morning.length > 0 && (
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-3">Morning</h3>
              <div className="grid grid-cols-3 gap-2">
                {groupedSlots.morning.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onSlotSelect(slot)}
                    className="text-center py-3 border border-gray-300 rounded-md hover:bg-primary-50 hover:border-primary-300 transition-colors"
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {groupedSlots.afternoon.length > 0 && (
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-3">Afternoon</h3>
              <div className="grid grid-cols-3 gap-2">
                {groupedSlots.afternoon.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onSlotSelect(slot)}
                    className="text-center py-3 border border-gray-300 rounded-md hover:bg-primary-50 hover:border-primary-300 transition-colors"
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {groupedSlots.evening.length > 0 && (
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-3">Evening</h3>
              <div className="grid grid-cols-3 gap-2">
                {groupedSlots.evening.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onSlotSelect(slot)}
                    className="text-center py-3 border border-gray-300 rounded-md hover:bg-primary-50 hover:border-primary-300 transition-colors"
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
