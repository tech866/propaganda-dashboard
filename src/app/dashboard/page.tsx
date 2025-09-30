'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Development mode - bypass authentication
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
      setIsLoading(false);
      return;
    }

    // Production mode - would use Clerk authentication
    // For now, just set loading to false
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <ModernDashboardLayout>
      <EnhancedDashboard />
    </ModernDashboardLayout>
  );
}