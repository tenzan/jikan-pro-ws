"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addMinutes, parse, isAfter, startOfDay, endOfDay } from "date-fns";

// Define types based on Prisma schema
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

interface AppointmentFormProps {
  businessId: string;
  services?: Service[];
  staff?: User[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AppointmentForm({
  businessId,
  services = [],
  staff = [],
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Check if there's a date in the URL (from calendar click)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dateParam = params.get('date');
      if (dateParam) {
        setFormData(prev => ({
          ...prev,
          date: dateParam
        }));
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    serviceId: "",
    staffId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });

  // Generate time slots based on service duration
  useEffect(() => {
    if (!formData.serviceId || !formData.date || !formData.staffId) {
      setAvailableTimeSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      try {
        const selectedService = services.find(s => s.id === formData.serviceId);
        if (!selectedService) return;

        const duration = selectedService.duration;
        const date = parse(formData.date, "yyyy-MM-dd", new Date());
        
        // Fetch existing appointments for the selected staff and date
        const start = startOfDay(date).toISOString();
        const end = endOfDay(date).toISOString();
        
        const response = await fetch(
          `/api/availability?staffId=${formData.staffId}&date=${formData.date}&serviceId=${formData.serviceId}&startDate=${start}&endDate=${end}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch availability");
        }
        
        const { availableSlots } = await response.json();
        setAvailableTimeSlots(availableSlots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setError("Failed to load available time slots");
      }
    };

    fetchAvailableSlots();
  }, [formData.serviceId, formData.date, formData.staffId, services]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.serviceId || !formData.staffId || !formData.time) {
        throw new Error("Please fill in all required fields");
      }

      const selectedService = services.find(s => s.id === formData.serviceId);
      if (!selectedService) {
        throw new Error("Invalid service selected");
      }

      // Combine date and time into ISO string
      const startTime = parse(
        `${formData.date} ${formData.time}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      ).toISOString();

      const appointmentData = {
        startTime,
        serviceId: formData.serviceId,
        staffId: formData.staffId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        notes: formData.notes,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/appointments");
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while creating the appointment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule New Appointment</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
              Service *
            </label>
            <select
              id="serviceId"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
              Staff Member *
            </label>
            <select
              id="staffId"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={format(new Date(), "yyyy-MM-dd")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time *
            </label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={availableTimeSlots.length === 0}
            >
              <option value="">
                {availableTimeSlots.length === 0 
                  ? "Select service, staff and date first" 
                  : "Select a time"}
              </option>
              {availableTimeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Customer Name *
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
              Customer Email *
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
              Customer Phone
            </label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
