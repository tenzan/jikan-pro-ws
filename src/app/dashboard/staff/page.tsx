import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import Link from "next/link";

async function getStaff(businessId: string) {
  return prisma.user.findMany({
    where: {
      businessId,
      role: {
        in: ["STAFF", "OWNER"]
      }
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function StaffPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  // If user doesn't have a business ID, show a message instead of redirecting
  const staff = session.user.businessId 
    ? await getStaff(session.user.businessId)
    : [];

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
        {session.user.businessId && (
          <Link
            href="/dashboard/staff/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Staff Member
          </Link>
        )}
      </div>

      {!session.user.businessId ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">No Business Set Up</h2>
          <p className="text-gray-600 mb-6">You need to set up a business before you can manage staff members.</p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Profile
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {staff.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No staff members found. Add your first staff member to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {staff.map((staffMember) => (
                <li key={staffMember.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {staffMember.name ? staffMember.name.substring(0, 2).toUpperCase() : "ST"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staffMember.name || "Unnamed Staff"}</div>
                          <div className="text-sm text-gray-500">{staffMember.email}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {staffMember.role}
                        </span>
                        <Link
                          href={`/dashboard/staff/${staffMember.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
