"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { format, parseISO } from "date-fns";

// Define types based on Prisma schema
interface Appointment {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  customerId: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  notes?: string | null;
  customer: Customer;
  service: Service;
  staff: User;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  description?: string | null;
  businessId: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  businessId?: string | null;
}

interface FullCalendarViewProps {
  initialAppointments: Appointment[];
}

export default function FullCalendarView({ initialAppointments }: FullCalendarViewProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Transform appointments into FullCalendar events
  const events = appointments.map((appointment) => {
    // Determine color based on status
    let backgroundColor = "#3788d8"; // Default blue
    switch (appointment.status) {
      case "CONFIRMED":
        backgroundColor = "#10b981"; // Green
        break;
      case "CANCELLED":
        backgroundColor = "#ef4444"; // Red
        break;
      case "COMPLETED":
        backgroundColor = "#6366f1"; // Indigo
        break;
      case "PENDING":
        backgroundColor = "#f59e0b"; // Amber
        break;
    }

    return {
      id: appointment.id,
      title: `${appointment.service.name} - ${appointment.customer.name}`,
      start: appointment.startTime,
      end: appointment.endTime,
      backgroundColor,
      borderColor: backgroundColor,
      extendedProps: {
        appointment,
      },
    };
  });

  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDateClick = (info: any) => {
    // Navigate to new appointment page with the selected date
    router.push(`/dashboard/appointments/new?date=${info.dateStr}`);
  };

  const loadAppointments = async (startStr: string, endStr: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/appointments?startDate=${startStr}&endDate=${endStr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      // Update the local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus as any }
            : appointment
        )
      );

      // Close the modal if open
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({
          ...selectedAppointment,
          status: newStatus as any,
        });
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      // Update the local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: "CANCELLED" as any }
            : appointment
        )
      );

      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={(dateInfo) => {
            loadAppointments(dateInfo.startStr, dateInfo.endStr);
          }}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          nowIndicator={true}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: "09:00",
            endTime: "17:00",
          }}
        />
      </div>

      {/* Appointment Detail Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">
                Appointment Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Service</h4>
                <p className="text-sm text-gray-900">
                  {selectedAppointment.service.name} (
                  {selectedAppointment.service.duration} min)
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                <p className="text-sm text-gray-900">
                  {format(
                    parseISO(selectedAppointment.startTime.toString()),
                    "PPp"
                  )}{" "}
                  -{" "}
                  {format(
                    parseISO(selectedAppointment.endTime.toString()),
                    "p"
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                <p className="text-sm text-gray-900">
                  {selectedAppointment.customer.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAppointment.customer.email}
                </p>
                {selectedAppointment.customer.phone && (
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.customer.phone}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Staff</h4>
                <p className="text-sm text-gray-900">
                  {selectedAppointment.staff.name}
                </p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="text-sm text-gray-900">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <select
                  value={selectedAppointment.status}
                  onChange={(e) =>
                    handleStatusChange(selectedAppointment.id, e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel Appointment
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
