import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StaffSchedulingPage from "@/app/components/scheduling/StaffSchedulingPage";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { username: string } }
): Promise<Metadata> {
  const { username } = params;
  const staff = await prisma.user.findUnique({
    where: { slug: username },
  });

  return {
    title: `Schedule with ${staff?.name || 'Not Found'}`,
    description: `Book a time with ${staff?.name || 'Not Found'}`,
  };
}

async function getStaffData(username: string) {
  const staff = await prisma.user.findUnique({
    where: { slug: username },
    include: {
      business: true,
      eventTypes: {
        where: { isActive: true },
        orderBy: { duration: 'asc' },
      },
    },
  });

  if (!staff) {
    notFound();
  }

  return staff;
}

export default async function StaffSchedulePage({
  params,
}: {
  params: { username: string }
}) {  
  const { username } = params;
  const staff = await getStaffData(username);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <StaffSchedulingPage staff={staff} />
      </div>
    </main>
  );
}
