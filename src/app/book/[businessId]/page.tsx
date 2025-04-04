import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/app/components/BookingForm";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ businessId: string }> }
): Promise<Metadata> {
  const { businessId } = await params;
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  return {
    title: `Book - ${business?.name || 'Business Not Found'}`,
  };
}

async function getBusinessData(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      services: true,
      staff: {
        where: { role: "STAFF" },
      },
      workingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  if (!business) {
    notFound();
  }

  return business;
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {  
  const { businessId } = await params;
  const business = await getBusinessData(businessId);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Book an Appointment with {business.name}
            </h1>
            
            <Suspense fallback={<div>Loading...</div>}>
              <BookingForm
                business={business}
                services={business.services}
                staff={business.staff}
                workingHours={business.workingHours}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
