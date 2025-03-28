import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import AppointmentCalendar from "@/app/components/AppointmentCalendar";

const prisma = new PrismaClient();

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

  if (!session?.user?.businessId) {
    redirect("/auth/signin");
  }

  const appointments = await getAppointments(session.user.businessId);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
      </div>

      <Suspense fallback={<div>Loading calendar...</div>}>
        <AppointmentCalendar initialAppointments={appointments} />
      </Suspense>
    </main>
  );
}
