'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRBAC } from '@/hooks/useRBAC';
import { RBACGuard } from '@/components/rbac/RBACGuard';
import MetricsCards from './MetricsCards';
import TrafficSourceBreakdown from './TrafficSourceBreakdown';
import ConversionFunnel from './ConversionFunnel';
import TimeSeriesChart from './TimeSeriesChart';
import RealTimeMetrics from './RealTimeMetrics';
import AnalyticsFilters from './AnalyticsFilters';
import { SalesMetrics, MetricsFilter } from '@/lib/services/analyticsService';

interface AdvancedAnalyticsDashboardProps {
  className?: string;
}

export default function AdvancedAnalyticsDashboard({ className = '' }: AdvancedAnalyticsDashboardProps) {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { checkPermission, canViewAnalytics } = useRBAC({ 
    workspaceId: currentWorkspace?.id 
  });
  
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MetricsFilter>({
    workspace_id: currentWorkspace?.id || '',
    traffic_source: 'all'
  });

  console.log('🎯 Component render state:', { 
    currentWorkspace, 
    filters, 
    loading, 
    error, 
    metrics 
  });

  // Check permissions
  const canViewDetailedMetrics = checkPermission('analytics:detailed');

  useEffect(() => {
    console.log('🏢 currentWorkspace changed:', currentWorkspace);
    if (currentWorkspace?.id) {
      console.log('✅ Setting workspace_id in filters:', currentWorkspace.id);
      setFilters(prev => ({
        ...prev,
        workspace_id: currentWorkspace.id
      }));
    } else {
      console.log('❌ No currentWorkspace.id available');
    }
  }, [currentWorkspace]);

  useEffect(() => {
    console.log('🔄 useEffect triggered', { filters, currentWorkspace });
    // Temporarily always call fetchMetrics for testing
    console.log('🔧 Always calling fetchMetrics for testing');
    fetchMetrics();
  }, [filters]);

  const fetchMetrics = async () => {
    console.log('🔍 fetchMetrics called', { currentWorkspace, filters });
    
    // Temporarily bypass workspace requirement for testing
    console.log('🔧 Bypassing workspace check for testing');

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('workspace_id', filters.workspace_id);
      
      if (filters.traffic_source && filters.traffic_source !== 'all') {
        queryParams.append('traffic_source', filters.traffic_source);
      }
      if (filters.user_id) {
        queryParams.append('user_id', filters.user_id);
      }
      if (filters.client_id) {
        queryParams.append('client_id', filters.client_id);
      }
      if (filters.date_from) {
        queryParams.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        queryParams.append('date_to', filters.date_to);
      }

      console.log('📡 Making API call to:', `/api/analytics/test`);
      const response = await fetch(`/api/analytics/test`);
      
      console.log('📡 API response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API data received:', data);
      setMetrics(data.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<MetricsFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Temporarily bypass RBAC check for development
  // TODO: Implement proper workspace setup and RBAC
  if (false && !canViewAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to view analytics. Contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-4">Loading analytics...</p>
          <button 
            onClick={() => {
              console.log('🔧 Manual fetch triggered');
              fetchMetrics();
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm"
          >
            Force Load Analytics
          </button>
        </div>
      </div>
    );
  }

  // Temporarily bypass workspace check for testing
  // if (!currentWorkspace) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
  //       <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
  //         <h2 className="text-2xl font-bold text-foreground mb-4">No Workspace Selected</h2>
  //         <p className="text-muted-foreground mb-6">
  //           Please select a workspace to view analytics.
  //         </p>
  //         <button 
  //           onClick={() => window.location.href = '/dashboard'}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Sales Analytics</h1>
          <p className="text-muted-foreground">
            Real-time insights into your sales performance and conversion metrics
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <AnalyticsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            workspaceId={currentWorkspace?.id}
          />
        </div>

        {/* Real-time Metrics */}
        <RBACGuard permissions={['analytics:detailed']}>
          <div className="mb-8">
            <RealTimeMetrics workspaceId={filters.workspace_id} />
          </div>
        </RBACGuard>

        {/* Main Metrics Cards */}
        {metrics && (
          <div className="mb-8">
            <MetricsCards metrics={metrics} />
          </div>
        )}

        {/* Traffic Source Breakdown */}
        <RBACGuard permissions={['analytics:detailed']}>
          <div className="mb-8">
            <TrafficSourceBreakdown filters={filters} />
          </div>
        </RBACGuard>

        {/* Conversion Funnel */}
        <div className="mb-8">
          <ConversionFunnel filters={filters} />
        </div>

        {/* Time Series Chart */}
        <RBACGuard permissions={['analytics:detailed']}>
          <div className="mb-8">
            <TimeSeriesChart filters={filters} />
          </div>
        </RBACGuard>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
