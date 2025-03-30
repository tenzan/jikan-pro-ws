"use client";

import { useState, useEffect } from "react";
import { EventType, Service } from "@prisma/client";

interface EventTypeFormProps {
  eventType?: EventType;
  services: Service[];
  onCancel: () => void;
  onSuccess: (eventType: EventType) => void;
}

interface CustomQuestion {
  id: string;
  text: string;
  type: "text" | "textarea" | "select";
  required?: boolean;
  options?: string[];
}

export default function EventTypeForm({
  eventType,
  services,
  onCancel,
  onSuccess,
}: EventTypeFormProps) {
  const [title, setTitle] = useState(eventType?.title || "");
  const [slug, setSlug] = useState(eventType?.slug || "");
  const [description, setDescription] = useState(eventType?.description || "");
  const [duration, setDuration] = useState(eventType?.duration || 30);
  const [serviceId, setServiceId] = useState(eventType?.serviceId || "");
  const [location, setLocation] = useState(eventType?.location || "");
  const [color, setColor] = useState(eventType?.color || "#3788d8");
  const [isActive, setIsActive] = useState(eventType?.isActive ?? true);
  const [requiresConfirmation, setRequiresConfirmation] = useState(
    eventType?.requiresConfirmation ?? false
  );
  const [minimumNotice, setMinimumNotice] = useState(eventType?.minimumNotice || 0);
  const [bufferBefore, setBufferBefore] = useState(eventType?.bufferBefore || 0);
  const [bufferAfter, setBufferAfter] = useState(eventType?.bufferAfter || 0);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Parse custom questions from JSON if they exist
  useEffect(() => {
    if (eventType?.customQuestions) {
      try {
        const parsedQuestions = JSON.parse(eventType.customQuestions as string);
        setCustomQuestions(parsedQuestions);
      } catch (e) {
        console.error("Error parsing custom questions:", e);
      }
    }
  }, [eventType]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!eventType && title) {
      setSlug(title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }, [title, eventType]);

  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: `q-${Date.now()}`,
      text: "",
      type: "text",
      required: false,
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const updateCustomQuestion = (id: string, field: string, value: any) => {
    setCustomQuestions(
      customQuestions.map((q) => {
        if (q.id === id) {
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setCustomQuestions(
      customQuestions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...(q.options || []), ""],
          };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setCustomQuestions(
      customQuestions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[index] = value;
          return {
            ...q,
            options: newOptions,
          };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, index: number) => {
    setCustomQuestions(
      customQuestions.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.filter((_, i) => i !== index),
          };
        }
        return q;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        title,
        slug,
        description,
        duration: Number(duration),
        serviceId: serviceId || null,
        location,
        color,
        isActive,
        requiresConfirmation,
        minimumNotice: Number(minimumNotice),
        bufferBefore: Number(bufferBefore),
        bufferAfter: Number(bufferAfter),
        customQuestions,
      };

      const url = eventType
        ? `/api/event-types/${eventType.id}`
        : "/api/event-types";
      const method = eventType ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${eventType ? "update" : "create"} event type`);
      }

      const data = await response.json();
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="30 Minute Meeting"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            URL Slug *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              /schedule/your-name/
            </span>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
              required
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="30-minute-meeting"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="A brief description of your meeting type"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="1"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">
            Service
          </label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">No service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="In-person, Phone, Google Meet, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="ml-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="minimumNotice" className="block text-sm font-medium text-gray-700">
            Minimum Notice (minutes)
          </label>
          <input
            type="number"
            id="minimumNotice"
            value={minimumNotice}
            onChange={(e) => setMinimumNotice(Number(e.target.value))}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bufferBefore" className="block text-sm font-medium text-gray-700">
            Buffer Before (minutes)
          </label>
          <input
            type="number"
            id="bufferBefore"
            value={bufferBefore}
            onChange={(e) => setBufferBefore(Number(e.target.value))}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="bufferAfter" className="block text-sm font-medium text-gray-700">
            Buffer After (minutes)
          </label>
          <input
            type="number"
            id="bufferAfter"
            value={bufferAfter}
            onChange={(e) => setBufferAfter(Number(e.target.value))}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="requiresConfirmation"
            type="checkbox"
            checked={requiresConfirmation}
            onChange={(e) => setRequiresConfirmation(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="requiresConfirmation" className="ml-2 block text-sm text-gray-700">
            Requires Confirmation
          </label>
        </div>
      </div>

      {/* Custom Questions Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">Custom Questions</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add questions that attendees must answer when booking this event type
        </p>

        {customQuestions.length > 0 && (
          <div className="mt-4 space-y-6">
            {customQuestions.map((question, index) => (
              <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-700">Question {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCustomQuestion(question.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`question-${question.id}-text`} className="block text-sm font-medium text-gray-700">
                      Question Text
                    </label>
                    <input
                      type="text"
                      id={`question-${question.id}-text`}
                      value={question.text}
                      onChange={(e) => updateCustomQuestion(question.id, "text", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor={`question-${question.id}-type`} className="block text-sm font-medium text-gray-700">
                      Question Type
                    </label>
                    <select
                      id={`question-${question.id}-type`}
                      value={question.type}
                      onChange={(e) => updateCustomQuestion(question.id, "type", e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="select">Select (Dropdown)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex items-center">
                  <input
                    id={`question-${question.id}-required`}
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateCustomQuestion(question.id, "required", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`question-${question.id}-required`} className="ml-2 block text-sm text-gray-700">
                    Required
                  </label>
                </div>

                {question.type === "select" && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    {question.options && question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="mt-2 flex items-center">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(question.id, optionIndex)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(question.id)}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addCustomQuestion}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Question
        </button>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting
            ? eventType
              ? "Updating..."
              : "Creating..."
            : eventType
            ? "Update Event Type"
            : "Create Event Type"}
        </button>
      </div>
    </form>
  );
}
