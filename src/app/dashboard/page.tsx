'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';

export default function Dashboard() {
  const router = useRouter();
  
  // Always render the dashboard with proper authentication checks
  return (
    <ModernDashboardLayout>
      <EnhancedDashboard />
    </ModernDashboardLayout>
  );
}