import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AppointmentForm from "@/app/components/AppointmentForm";

async function getBusinessData(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      services: true,
      staff: {
        where: { role: "STAFF" },
      },
    },
  });

  return business;
}

export default async function NewAppointmentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.businessId) {
    redirect("/auth/signin");
  }

  const business = await getBusinessData(session.user.businessId);

  if (!business) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Business Not Found</h1>
        </div>
        <p>The business associated with your account could not be found.</p>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">New Appointment</h1>
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Appointments
        </Link>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <AppointmentForm
          businessId={business.id}
          services={business.services}
          staff={business.staff}
        />
      </Suspense>
    </main>
  );
}
