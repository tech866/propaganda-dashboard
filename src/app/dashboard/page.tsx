'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';
import ProgressiveDashboard from '@/components/dashboard/ProgressiveDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [useProgressiveLoading, setUseProgressiveLoading] = useState(true);
  
  // Always render the dashboard with proper authentication checks
  return (
    <ModernDashboardLayout>
      {useProgressiveLoading ? (
        <ProgressiveDashboard />
      ) : (
        <EnhancedDashboard />
      )}
    </ModernDashboardLayout>
  );
}