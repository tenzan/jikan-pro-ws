import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EventTypesList from "@/app/components/dashboard/EventTypesList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Types | Jikan Pro",
  description: "Manage your scheduling event types",
};

async function getEventTypes(userId: string) {
  const eventTypes = await prisma.eventType.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return eventTypes;
}

export default async function EventTypesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signin");
  }
  
  const eventTypes = await getEventTypes(session.user.id);
  const services = await prisma.service.findMany({
    where: {
      businessId: session.user.businessId!,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage your scheduling event types
        </p>
      </div>
      
      <EventTypesList 
        initialEventTypes={eventTypes} 
        services={services}
        userSlug={session.user.slug || undefined}
      />
    </div>
  );
}
