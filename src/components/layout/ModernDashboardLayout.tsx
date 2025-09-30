'use client';

import { ReactNode } from 'react';
import ModernHeader from './ModernHeader';
import ModernSidebar from './ModernSidebar';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';

interface ModernDashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ModernDashboardLayout({ 
  children, 
  className = '' 
}: ModernDashboardLayoutProps) {
  const { user, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Premium Sidebar - Hidden on mobile, shown on desktop */}
      <ModernSidebar className="hidden lg:flex" />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ModernHeader />
        
        {/* Main Content */}
        <main className={cn("flex-1 overflow-auto", className)}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
