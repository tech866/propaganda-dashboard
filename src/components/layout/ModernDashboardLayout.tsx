'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Development mode - bypass authentication
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
      // Mock user for development
      setUser({
        id: 'dev-user-1',
        email: 'dev@example.com',
        name: 'Development User',
        role: 'admin'
      });
      setIsLoading(false);
      return;
    }

    // Production mode - would use Clerk authentication
    // For now, just set loading to false
    setIsLoading(false);
  }, []);

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
    return null;
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
