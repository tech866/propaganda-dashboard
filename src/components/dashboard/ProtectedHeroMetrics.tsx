'use client';

import { useEffect, useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { ProtectedComponent } from '@/components/auth/ProtectedComponent';

interface MetricsData {
  showRate?: {
    percentage: number;
    total: number;
    shows: number;
  };
  closeRate?: {
    percentage: number;
    total: number;
    closes: number;
  };
  totalCalls?: number;
  wonCalls?: number;
}

interface ProtectedHeroMetricsProps {
  className?: string;
  showAllData?: boolean; // If true, shows all data regardless of role
}

function HeroMetricsContent({ className = '', showAllData = false }: ProtectedHeroMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, hasAnyRole } = useRole();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which metrics endpoint to call based on user role
        let endpoint = '/api/metrics';
        if (showAllData || hasAnyRole(['admin', 'ceo'])) {
          // Admin and CEO can see all data
          endpoint = '/api/metrics?includeAll=true';
        } else if (user?.role === 'sales') {
          // Sales users only see their own data
          endpoint = `/api/metrics?userId=${user.id}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
        
        const data = await response.json();
        setMetrics(data.data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user, hasAnyRole, showAllData]);

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-300 h-24 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Metrics Unavailable</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Metrics Data</h3>
          <p className="text-gray-600">No metrics data available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Show Rate */}
        {metrics.showRate && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Show Rate</p>
                <p className="text-3xl font-bold">{metrics.showRate.percentage.toFixed(1)}%</p>
                <p className="text-blue-100 text-sm">
                  {metrics.showRate.shows} of {metrics.showRate.total} calls
                </p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Close Rate */}
        {metrics.closeRate && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Close Rate</p>
                <p className="text-3xl font-bold">{metrics.closeRate.percentage.toFixed(1)}%</p>
                <p className="text-green-100 text-sm">
                  {metrics.closeRate.closes} of {metrics.closeRate.total} shows
                </p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Total Calls */}
        {metrics.totalCalls !== undefined && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Calls</p>
                <p className="text-3xl font-bold">{metrics.totalCalls}</p>
                <p className="text-purple-100 text-sm">All time</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Won Calls */}
        {metrics.wonCalls !== undefined && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Won Calls</p>
                <p className="text-3xl font-bold">{metrics.wonCalls}</p>
                <p className="text-orange-100 text-sm">Successfully closed</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 p-3 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProtectedHeroMetrics(props: ProtectedHeroMetricsProps) {
  return (
    <ProtectedComponent
      requiredPermissions={['view_own_metrics']}
      showAccessDenied={true}
    >
      <HeroMetricsContent {...props} />
    </ProtectedComponent>
  );
}
