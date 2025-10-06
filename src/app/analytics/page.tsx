'use client';

import { Metadata } from 'next';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';

export default function AnalyticsPage() {
  return (
    <ModernDashboardLayout>
      <WorkspaceProvider>
        <AdvancedAnalyticsDashboard />
      </WorkspaceProvider>
    </ModernDashboardLayout>
  );
}