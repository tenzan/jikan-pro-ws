"use client";

import { useState } from "react";
import { format } from "date-fns";
import { User, Business, EventType } from "@prisma/client";

interface StaffWithRelations extends User {
  business: Business | null;
}

interface BookingFormProps {
  staff: StaffWithRelations;
  eventType: EventType;
  selectedDate: Date;
  selectedTime: string;
  timezone: string;
}

export default function BookingForm({
  staff,
  eventType,
  selectedDate,
  selectedTime,
  timezone,
}: BookingFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  // Parse custom questions if they exist
  const customQuestions = eventType.customQuestions 
    ? JSON.parse(eventType.customQuestions as string) 
    : [];

  const handleCustomResponseChange = (questionId: string, value: string) => {
    setCustomResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Format the date and time for the API
      const dateTimeStr = `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`;

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: dateTimeStr,
          eventTypeId: eventType.id,
          serviceId: eventType.serviceId || null,
          staffId: staff.id,
          customerName,
          customerEmail,
          customerPhone,
          notes,
          timezone,
          responses: customResponses,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create appointment");
      }

      const appointmentData = await response.json();
      setAppointmentDetails(appointmentData);
      setBookingComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-3 text-lg font-medium text-gray-900">Booking confirmed</h2>
          <p className="mt-2 text-sm text-gray-500">
            You're scheduled with {staff.name}
          </p>
        </div>

        <div className="mt-6 border-t border-b border-gray-200 py-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-500">What</span>
            <span className="text-gray-900">{eventType.title}</span>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="font-medium text-gray-500">When</span>
            <span className="text-gray-900">
              {format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
            </span>
          </div>
          {eventType.location && (
            <div className="mt-3 flex justify-between text-sm">
              <span className="font-medium text-gray-500">Where</span>
              <span className="text-gray-900">{eventType.location}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 text-center">
            A calendar invitation has been sent to your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Enter your details
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Custom questions */}
        {customQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Additional Information</h3>
            
            {customQuestions.map((question: any) => (
              <div key={question.id}>
                <label htmlFor={`question-${question.id}`} className="block text-sm font-medium text-gray-700">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {question.type === 'text' && (
                  <input
                    type="text"
                    id={`question-${question.id}`}
                    value={customResponses[question.id] || ''}
                    onChange={(e) => handleCustomResponseChange(question.id, e.target.value)}
                    required={question.required}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
                
                {question.type === 'textarea' && (
                  <textarea
                    id={`question-${question.id}`}
                    value={customResponses[question.id] || ''}
                    onChange={(e) => handleCustomResponseChange(question.id, e.target.value)}
                    required={question.required}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
                
                {question.type === 'select' && (
                  <select
                    id={`question-${question.id}`}
                    value={customResponses[question.id] || ''}
                    onChange={(e) => handleCustomResponseChange(question.id, e.target.value)}
                    required={question.required}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Booking Summary</h3>
          <div className="text-sm text-gray-500">
            <p>{eventType.title} with {staff.name}</p>
            <p className="mt-1">{format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}</p>
            <p className="mt-1">{eventType.duration} minutes</p>
            {eventType.location && <p className="mt-1">Location: {eventType.location}</p>}
            <p className="mt-1 text-xs">Timezone: {timezone}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "Scheduling..." : "Schedule Event"}
        </button>
      </form>
    </div>
  );
}
