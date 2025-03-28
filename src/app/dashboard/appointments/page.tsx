import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import FullCalendarView from "@/app/components/FullCalendarView";
import { prisma } from '@/lib/prisma';

async function getAppointments(businessId: string) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  return prisma.appointment.findMany({
    where: {
      businessId,
      startTime: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      service: true,
      staff: true,
      customer: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });
}

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // If user doesn't have a business ID, show a message instead of redirecting
  const appointments = session.user.businessId 
    ? await getAppointments(session.user.businessId)
    : [];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
        {session.user.businessId && (
          <a
            href="/dashboard/appointments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Appointment
          </a>
        )}
      </div>

      {!session.user.businessId ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">No Business Set Up</h2>
          <p className="text-gray-600 mb-6">You need to set up a business before you can manage appointments.</p>
          <a
            href="/dashboard/profile"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Profile
          </a>
        </div>
      ) : (
        <Suspense fallback={<div>Loading calendar...</div>}>
          <FullCalendarView initialAppointments={appointments} />
        </Suspense>
      )}
    </main>
  );
}
