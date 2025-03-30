"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfDay, endOfDay } from "date-fns";
import { User, Business, EventType } from "@prisma/client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import BookingForm from "./BookingForm";

interface StaffWithRelations extends User {
  business: Business | null;
}

interface EventTypeBookingPageProps {
  staff: StaffWithRelations;
  eventType: EventType;
}

export default function EventTypeBookingPage({ 
  staff, 
  eventType 
}: EventTypeBookingPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currentTimezone, setCurrentTimezone] = useState<string>("");

  // Detect user's timezone
  useEffect(() => {
    setCurrentTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Fetch available time slots when a date is selected
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailableSlots = async () => {
      setIsLoading(true);
      setAvailableSlots([]);
      setSelectedTime(null);

      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const response = await fetch(
          `/api/availability?staffId=${staff.id}&date=${dateStr}&serviceId=${eventType.serviceId || ""}&eventTypeId=${eventType.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch availability");
        }

        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } catch (error) {
        console.error("Error fetching available slots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, staff.id, eventType.id, eventType.serviceId]);

  const handleDateClick = (info: any) => {
    setSelectedDate(new Date(info.dateStr));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowBookingForm(true);
  };

  const handleBackToTimeSelection = () => {
    setShowBookingForm(false);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{eventType.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {eventType.duration} min | {eventType.location || "No location specified"}
            </p>
            {eventType.description && (
              <p className="mt-2 text-sm text-gray-600">{eventType.description}</p>
            )}
          </div>
          <div className="mt-3 sm:mt-0 flex items-center text-sm text-gray-500">
            <span>with </span>
            <span className="font-medium text-gray-900 ml-1">{staff.name}</span>
          </div>
        </div>
      </div>

      {/* Booking flow */}
      <div className="p-4 sm:p-6">
        {!showBookingForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next",
                    center: "title",
                    right: "",
                  }}
                  height="auto"
                  dateClick={handleDateClick}
                  validRange={{
                    start: new Date(),
                    end: addDays(new Date(), 60), // Allow booking up to 60 days in advance
                  }}
                  dayMaxEvents={0}
                  fixedWeekCount={false}
                />
              </div>
            </div>

            {/* Time slots */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedDate
                    ? `Available times for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`
                    : "Select a date to view available times"}
                </h2>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedDate && availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className="py-2 px-3 text-center border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No available times on this date</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Select a date to view available times</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={handleBackToTimeSelection}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to time selection
            </button>
            
            {selectedDate && selectedTime && (
              <BookingForm
                staff={staff}
                eventType={eventType}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                timezone={currentTimezone}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Powered by */}
      <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
        Powered by Jikan Pro
      </div>
    </div>
  );
}
