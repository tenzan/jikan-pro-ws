'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface BusinessContextType {
  businessId: string | null;
  isOwner: boolean;
  isStaff: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  
  const businessId = session?.user?.businessId || null;
  const isOwner = session?.user?.role === 'OWNER';
  const isStaff = session?.user?.role === 'STAFF';

  return (
    <BusinessContext.Provider value={{ businessId, isOwner, isStaff }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
