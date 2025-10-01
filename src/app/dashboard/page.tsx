'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';

export default function Dashboard() {
  const router = useRouter();
  
  // Bypass all loading states for development
  if (process.env.NODE_ENV === 'development') {
    return (
      <ModernDashboardLayout>
        <EnhancedDashboard />
      </ModernDashboardLayout>
    );
  }

  // Production mode would have proper loading states
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white">Loading...</div>
    </div>
  );
}