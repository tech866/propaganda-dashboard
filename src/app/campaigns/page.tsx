'use client';

import { useEffect, useState } from 'react';
// import { useUser } from '@clerk/nextjs'; // Temporarily disabled for development
import { useRouter } from 'next/navigation';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { useAgency } from '@/contexts/AgencyContext';
import { useRole } from '@/contexts/RoleContext';
import { CampaignManagement } from '@/components/campaigns/CampaignManagement';

export default function CampaignsPage() {
  const { user: roleUser, isLoading: userLoading } = useRole();
  const { agency, isLoading: agencyLoading } = useAgency();
  const router = useRouter();

  // Development mode - bypass authentication
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
    // Mock user is already set in RoleContext
  }

  if (userLoading || agencyLoading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ModernDashboardLayout>
    );
  }

  if (!roleUser) {
    return null;
  }

  if (!agency) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No agency data available</p>
          </div>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout>
      <CampaignManagement agencyId={agency.id} />
    </ModernDashboardLayout>
  );
}
