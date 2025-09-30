'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/clerk';

// Agency data interface
export interface Agency {
  id: string;
  name: string;
  registration_date: string;
  subscription_plan: 'basic' | 'professional' | 'enterprise';
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  billing_address?: string;
  active_status: boolean;
  created_at: string;
  updated_at: string;
}

// Agency context interface
interface AgencyContextType {
  agency: Agency | null;
  isLoading: boolean;
  error: string | null;
  refreshAgency: () => Promise<void>;
  canManageAgency: boolean;
  canViewFinancial: boolean;
  canManageUsers: boolean;
}

// Create the context
const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

// Agency provider component
export function AgencyProvider({ children }: { children: React.ReactNode }) {
  // Temporarily disable Clerk hooks for development
  // TODO: Re-enable when proper Clerk keys are configured
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock agency for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
      setAgency({
        id: 'dev-agency-1',
        name: 'Development Agency',
        registration_date: '2024-01-01',
        subscription_plan: 'professional',
        contact_info: {
          phone: '+1-555-0123',
          email: 'dev@agency.com',
          website: 'https://dev-agency.com'
        },
        billing_address: '123 Dev Street, Dev City, DC 12345',
        active_status: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      });
      setIsLoading(false);
      return;
    }
  }, []);
  
  // Original Clerk implementation (commented out for development)
  // const { user, isLoaded: userLoaded } = useUser();
  // const { organization, isLoaded: orgLoaded } = useOrganization();

  // Fetch agency data from Supabase
  const fetchAgency = async (agencyId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', agencyId)
        .eq('active_status', true)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setAgency(data);
    } catch (err) {
      console.error('Error fetching agency:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agency data');
      setAgency(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh agency data
  const refreshAgency = async () => {
    if (organization?.id) {
      await fetchAgency(organization.id);
    }
  };

  // Original Clerk useEffect (commented out for development)
  // useEffect(() => {
  //   if (!userLoaded || !orgLoaded) {
  //     setIsLoading(true);
  //     return;
  //   }

  //   if (!user || !organization) {
  //     setAgency(null);
  //     setIsLoading(false);
  //     return;
  //   }

  //   // Fetch agency data from Supabase using organization ID
  //   fetchAgency(organization.id);
  // }, [user, userLoaded, organization, orgLoaded]);

  // Mock permission checks for development
  const canManageAgency = true; // Admin user in development
  const canViewFinancial = true; // Admin user in development
  const canManageUsers = true; // Admin user in development

  const value: AgencyContextType = {
    agency,
    isLoading,
    error,
    refreshAgency,
    canManageAgency,
    canViewFinancial,
    canManageUsers,
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
}

// Custom hook to use the agency context
export function useAgency() {
  const context = useContext(AgencyContext);
  if (context === undefined) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
}

// Higher-order component for agency-based access control
export function withAgency<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission?: 'manage' | 'financial' | 'users'
) {
  return function AgencyProtectedComponent(props: T) {
    const { agency, isLoading, canManageAgency, canViewFinancial, canManageUsers } = useAgency();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!agency) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agency Access</h3>
            <p className="text-gray-600">
              You need to be part of an agency to access this content.
            </p>
          </div>
        </div>
      );
    }

    // Check specific permissions if required
    if (requiredPermission === 'manage' && !canManageAgency) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You don't have permission to manage this agency.
            </p>
          </div>
        </div>
      );
    }

    if (requiredPermission === 'financial' && !canViewFinancial) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You don't have permission to view financial data.
            </p>
          </div>
        </div>
      );
    }

    if (requiredPermission === 'users' && !canManageUsers) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You don't have permission to manage users.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Component for conditional rendering based on agency permissions
export function AgencyGuard({ 
  permission, 
  children, 
  fallback 
}: { 
  permission?: 'manage' | 'financial' | 'users';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { agency, isLoading, canManageAgency, canViewFinancial, canManageUsers } = useAgency();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agency) {
    return fallback || null;
  }

  // Check specific permissions if required
  if (permission === 'manage' && !canManageAgency) {
    return fallback || null;
  }

  if (permission === 'financial' && !canViewFinancial) {
    return fallback || null;
  }

  if (permission === 'users' && !canManageUsers) {
    return fallback || null;
  }

  return <>{children}</>;
}

export default AgencyContext;
