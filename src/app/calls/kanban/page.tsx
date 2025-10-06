'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Call } from '@/lib/types/call';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';

function KanbanPageContent() {
  const { user, isLoaded } = useAuth();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const router = useRouter();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user) {
      // Temporarily bypass workspace requirement for testing
      fetchCalls();
    }
  }, [user, isLoaded, router]);

  // Refresh data when page becomes visible (e.g., when navigating back from call logging)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Temporarily bypass workspace requirement for testing
        fetchCalls();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const fetchCalls = async () => {
    // Temporarily bypass workspace requirement for testing
    // if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching calls from test endpoint...');
      console.log('🔍 Current URL:', window.location.href);
      console.log('🔍 Current timestamp:', Date.now());
      
      // Use a test endpoint for now
      const url = `/api/calls/test?t=${Date.now()}`;
      console.log('🔍 Fetching from URL:', url);
      
      const response = await fetch(url);
      
      console.log('📡 API response:', { 
        status: response.status, 
        ok: response.ok, 
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calls: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Calls data received:', data);
      setCalls(data.calls || []);
    } catch (err) {
      console.error('❌ Error fetching calls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  const handleCallUpdate = async (callId: string, updates: Partial<Call>) => {
    // Temporarily bypass workspace requirement for testing
    // if (!currentWorkspace) return;
    
    try {
      const response = await fetch(`/api/calls/${callId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update call');
      }

      // Update local state optimistically
      setCalls(prevCalls =>
        prevCalls.map(call =>
          call.id === callId ? { ...call, ...updates } : call
        )
      );
    } catch (err) {
      console.error('Error updating call:', err);
      throw err;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading workspace and CRM Pipeline...</p>
        </div>
      </div>
    );
  }

  // Temporarily bypass workspace check for testing
  // if (!currentWorkspace) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
  //       <div className="text-center">
  //         <div className="text-red-500 text-6xl mb-4">⚠️</div>
  //         <h2 className="text-2xl font-bold text-foreground mb-4">No Workspace Selected</h2>
  //         <p className="text-muted-foreground mb-6">Please select a workspace to view the CRM pipeline.</p>
  //         <button
  //           onClick={() => router.push('/dashboard')}
  //           className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-200"
  //         >
  //           Go to Dashboard
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Pipeline</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={fetchCalls}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Analytics Dashboard */}
        <AnalyticsDashboard 
          workspaceId={currentWorkspace?.id || 'default'} 
          onRefresh={fetchCalls}
        />
        
        {/* Kanban Board */}
        <KanbanBoard
          calls={calls}
          onCallUpdate={handleCallUpdate}
          onRefresh={fetchCalls}
        />
      </div>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <ModernDashboardLayout>
      <WorkspaceProvider>
        <KanbanPageContent />
      </WorkspaceProvider>
    </ModernDashboardLayout>
  );
}
