import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EventTypeBookingPage from "@/app/components/scheduling/EventTypeBookingPage";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { username: string; eventType: string } }
): Promise<Metadata> {
  const { username, eventType } = params;
  
  const staff = await prisma.user.findUnique({
    where: { slug: username },
    include: {
      eventTypes: {
        where: { slug: eventType },
      },
    },
  });

  const eventTypeData = staff?.eventTypes[0];

  return {
    title: eventTypeData 
      ? `Book ${eventTypeData.title} with ${staff.name}` 
      : 'Booking Not Found',
    description: eventTypeData?.description || '',
  };
}

async function getEventTypeData(username: string, eventTypeSlug: string) {
  const staff = await prisma.user.findUnique({
    where: { slug: username },
    include: {
      business: true,
      eventTypes: {
        where: { 
          slug: eventTypeSlug,
          isActive: true,
        },
      },
    },
  });

  if (!staff || staff.eventTypes.length === 0) {
    notFound();
  }

  return {
    staff,
    eventType: staff.eventTypes[0],
  };
}

export default async function EventTypeBookingPage({
  params,
}: {
  params: { username: string; eventType: string }
}) {  
  const { username, eventType: eventTypeSlug } = params;
  const { staff, eventType } = await getEventTypeData(username, eventTypeSlug);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <EventTypeBookingPage 
          staff={staff} 
          eventType={eventType} 
        />
      </div>
    </main>
  );
}
