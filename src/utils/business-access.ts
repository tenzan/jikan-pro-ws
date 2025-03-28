import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export type BusinessAccess = {
  businessId: string;
  userRole: string;
};

export async function getBusinessAccess(): Promise<BusinessAccess | null> {
  const headersList = headers();
  const businessId = headersList.get('x-business-id');
  const userRole = headersList.get('x-user-role');

  if (!businessId || !userRole) {
    return null;
  }

  return { businessId, userRole };
}

export async function validateBusinessAccess(businessId: string) {
  const access = await getBusinessAccess();
  
  if (!access) {
    throw new Error('No business context found');
  }

  if (access.businessId !== businessId) {
    throw new Error('Access denied: Invalid business context');
  }

  return access;
}

export function withBusinessScope(businessId: string) {
  return {
    // Helper methods for common business-scoped operations
    appointments: {
      findMany: (args: any = {}) => prisma.appointment.findMany({
        ...args,
        where: {
          ...args.where,
          businessId,
        },
      }),
      create: (args: any) => prisma.appointment.create({
        ...args,
        data: {
          ...args.data,
          businessId,
        },
      }),
    },
    staff: {
      findMany: (args: any = {}) => prisma.user.findMany({
        ...args,
        where: {
          ...args.where,
          businessId,
        },
      }),
    },
    services: {
      findMany: (args: any = {}) => prisma.service.findMany({
        ...args,
        where: {
          ...args.where,
          businessId,
        },
      }),
      create: (args: any) => prisma.service.create({
        ...args,
        data: {
          ...args.data,
          businessId,
        },
      }),
    },
  };
}
