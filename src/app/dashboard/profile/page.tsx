import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                  {user.name || "Not set"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                  {user.role}
                </div>
              </div>
              {user.businessId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business ID</label>
                  <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                    {user.businessId}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Business Setup</h3>
            {!user.businessId ? (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You don't have a business set up yet. Create one to start managing appointments.
                </p>
                <Link
                  href="/dashboard/business/new"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Business
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  You're all set! Manage your business and appointments from the dashboard.
                </p>
                <Link
                  href="/dashboard/appointments"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Appointments
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
