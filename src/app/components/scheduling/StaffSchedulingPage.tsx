"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Business, EventType } from "@prisma/client";

interface StaffWithRelations extends User {
  business: Business | null;
  eventTypes: EventType[];
}

interface StaffSchedulingPageProps {
  staff: StaffWithRelations;
}

export default function StaffSchedulingPage({ staff }: StaffSchedulingPageProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Staff header */}
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {staff.avatarUrl ? (
              <Image
                src={staff.avatarUrl}
                alt={staff.name || "Staff member"}
                width={80}
                height={80}
                className="rounded-full border-2 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl font-bold">
                {staff.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <p className="text-blue-100">{staff.business?.name}</p>
            {staff.bio && <p className="mt-1 text-sm text-blue-50">{staff.bio}</p>}
          </div>
        </div>
      </div>
      
      {/* Event types */}
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select an event type</h2>
        
        <div className="space-y-3">
          {staff.eventTypes.length > 0 ? (
            staff.eventTypes.map((eventType) => (
              <Link 
                key={eventType.id} 
                href={`/schedule/${staff.slug}/${eventType.slug}`}
                className="block w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{eventType.title}</h3>
                    <p className="text-sm text-gray-500">{eventType.description}</p>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span>{eventType.duration} min</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No event types available for booking</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Powered by */}
      <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
        Powered by Jikan Pro
      </div>
    </div>
  );
}
