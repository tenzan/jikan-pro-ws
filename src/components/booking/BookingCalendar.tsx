'use client';

import { useState, useEffect } from 'react';
import { EventType, User, WorkingHours } from '@prisma/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import BookingTimeSlots from './BookingTimeSlots';
import BookingForm from './BookingForm';

interface BookingCalendarProps {
  eventType: EventType;
  user: User & {
    business: any;
  };
  workingHours: WorkingHours[];
}

export default function BookingCalendar({ eventType, user, workingHours }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<'calendar' | 'slots' | 'form'>('calendar');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get available time slots for a selected date
  const fetchAvailableSlots = async (date: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/availability?date=${date}&userId=${user.id}&eventTypeId=${eventType.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }
      
      const data = await response.json();
      setAvailableSlots(data.availableSlots);
    } catch (err) {
      setError('Failed to load available time slots. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (info: any) => {
    const selectedDateStr = info.dateStr;
    setSelectedDate(selectedDateStr);
    fetchAvailableSlots(selectedDateStr);
    setStep('slots');
  };

  // Handle time slot selection
  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  // Handle back button from time slots to calendar
  const handleBackToCalendar = () => {
    setSelectedDate(null);
    setAvailableSlots([]);
    setStep('calendar');
  };

  // Handle back button from form to time slots
  const handleBackToSlots = () => {
    setSelectedSlot(null);
    setStep('slots');
  };

  return (
    <div className="p-6">
      {step === 'calendar' && (
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            selectable={true}
            select={handleDateSelect}
            height="auto"
            fixedWeekCount={false}
            validRange={{
              start: new Date().toISOString().split('T')[0] // Only allow dates from today onwards
            }}
            businessHours={workingHours.map(wh => ({
              daysOfWeek: [wh.dayOfWeek], // 0=Sunday, 1=Monday, etc.
              startTime: wh.startTime,
              endTime: wh.endTime
            }))}
            selectConstraint="businessHours"
            dayMaxEvents={true}
            eventDisplay="block"
            eventBackgroundColor={eventType.color || '#0ea5e9'}
            eventBorderColor={eventType.color || '#0ea5e9'}
          />
        </div>
      )}

      {step === 'slots' && selectedDate && (
        <BookingTimeSlots
          date={selectedDate}
          availableSlots={availableSlots}
          onSlotSelect={handleSlotSelect}
          onBack={handleBackToCalendar}
          loading={loading}
          error={error}
        />
      )}

      {step === 'form' && selectedDate && selectedSlot && (
        <BookingForm
          eventType={eventType}
          user={user}
          date={selectedDate}
          time={selectedSlot}
          onBack={() => setStep('slots')}
        />
      )}
    </div>
  );
}
