'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ModernHeader from './ModernHeader';
import ModernSidebar from './ModernSidebar';
import { cn } from '@/lib/utils';

interface ModernDashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ModernDashboardLayout({ 
  children, 
  className = '' 
}: ModernDashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <ModernHeader />
      
      <div className="flex">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <ModernSidebar className="hidden lg:block" />
        
        {/* Main Content */}
        <main className={cn("flex-1 lg:ml-0", className)}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
