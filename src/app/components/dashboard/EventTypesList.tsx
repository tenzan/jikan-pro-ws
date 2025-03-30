"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventType, Service } from "@prisma/client";
import EventTypeForm from "./EventTypeForm";

interface EventTypeWithService extends EventType {
  service?: Service | null;
}

interface EventTypesListProps {
  initialEventTypes: EventTypeWithService[];
  services: Service[];
  userSlug?: string;
}

export default function EventTypesList({ 
  initialEventTypes, 
  services,
  userSlug
}: EventTypesListProps) {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventTypeWithService[]>(initialEventTypes);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreateSuccess = (newEventType: EventType) => {
    setEventTypes((prev) => [newEventType, ...prev]);
    setIsCreating(false);
    router.refresh();
  };

  const handleUpdateSuccess = (updatedEventType: EventType) => {
    setEventTypes((prev) => 
      prev.map((et) => et.id === updatedEventType.id ? updatedEventType : et)
    );
    setIsEditing(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event type? This cannot be undone.")) {
      return;
    }

    setIsDeleting(id);

    try {
      const response = await fetch(`/api/event-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete event type");
      }

      setEventTypes((prev) => prev.filter((et) => et.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting event type:", error);
      alert(error instanceof Error ? error.message : "Failed to delete event type");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleEventTypeStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/event-types/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update event type");
      }

      const updatedEventType = await response.json();
      setEventTypes((prev) => 
        prev.map((et) => et.id === updatedEventType.id ? updatedEventType : et)
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating event type:", error);
      alert(error instanceof Error ? error.message : "Failed to update event type");
    }
  };

  return (
    <div>
      {/* Create new event type button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Event Type
        </button>
      )}

      {/* Create form */}
      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Event Type</h2>
          <EventTypeForm 
            services={services} 
            onCancel={() => setIsCreating(false)}
            onSuccess={handleCreateSuccess}
          />
        </div>
      )}

      {/* Event types list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {eventTypes.length > 0 ? (
            eventTypes.map((eventType) => (
              <li key={eventType.id}>
                {isEditing === eventType.id ? (
                  <div className="p-6">
                    <EventTypeForm 
                      eventType={eventType}
                      services={services}
                      onCancel={() => setIsEditing(null)}
                      onSuccess={handleUpdateSuccess}
                    />
                  </div>
                ) : (
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3" 
                          style={{ backgroundColor: eventType.color }}
                        ></div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{eventType.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {eventType.duration} min
                            {eventType.service && ` • ${eventType.service.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Booking link */}
                        {userSlug && (
                          <Link 
                            href={`/schedule/${userSlug}/${eventType.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View booking page
                          </Link>
                        )}
                        
                        {/* Toggle active status */}
                        <div className="flex items-center">
                          <span className="mr-2 text-sm text-gray-500">
                            {eventType.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleEventTypeStatus(eventType.id, !eventType.isActive)}
                            className={`${
                              eventType.isActive ? "bg-blue-600" : "bg-gray-200"
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          >
                            <span
                              className={`${
                                eventType.isActive ? "translate-x-5" : "translate-x-0"
                              } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            ></span>
                          </button>
                        </div>
                        
                        {/* Edit button */}
                        <button
                          onClick={() => setIsEditing(eventType.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(eventType.id)}
                          disabled={isDeleting === eventType.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          {isDeleting === eventType.id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              <p>You haven't created any event types yet.</p>
              <p className="mt-1">Create your first event type to start scheduling meetings.</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
