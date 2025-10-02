'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface CallAnalytics {
  total_calls: number;
  total_shows: number;
  total_closes: number;
  paid_ads_calls: number;
  organic_calls: number;
  total_cash_collected: number;
  total_revenue: number;
  show_rate_percentage: number;
  close_rate_percentage: number;
  roas?: number;
  cost_per_acquisition?: number;
  revenue_per_lead?: number;
}

interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  userId?: string;
}

export default function CallAnalyticsDashboard() {
  const { user, isLoaded } = useAuth();
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  useEffect(() => {
    if (isLoaded && user) {
      loadAnalytics();
    }
  }, [isLoaded, user, filters]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.clientId) queryParams.append('clientId', filters.clientId);
      if (filters.userId) queryParams.append('userId', filters.userId);

      const response = await fetch(`/api/analytics/calls?${queryParams.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to load analytics');
      }

      setAnalytics(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Start logging calls to see analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Call Analytics</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user?.publicMetadata?.role?.toString().toUpperCase() || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={filters.clientId || ''}
                onChange={(e) => handleFilterChange('clientId', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Clients</option>
                {/* Add client options here */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <select
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Users</option>
                {/* Add user options here */}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📞</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Calls</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.total_calls}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Show Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.show_rate_percentage.toFixed(1)}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🎯</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Close Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.close_rate_percentage.toFixed(1)}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Cash Collected</dt>
                    <dd className="text-lg font-medium text-gray-900">${analytics.total_cash_collected.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Call Breakdown */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Call Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Shows</span>
                  <span className="text-sm font-medium text-gray-900">{analytics.total_shows}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Closes</span>
                  <span className="text-sm font-medium text-gray-900">{analytics.total_closes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Ads Calls</span>
                  <span className="text-sm font-medium text-gray-900">{analytics.paid_ads_calls}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Organic Calls</span>
                  <span className="text-sm font-medium text-gray-900">{analytics.organic_calls}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Metrics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium text-gray-900">${analytics.total_revenue.toLocaleString()}</span>
                </div>
                {analytics.revenue_per_lead && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue per Lead</span>
                    <span className="text-sm font-medium text-gray-900">${analytics.revenue_per_lead.toLocaleString()}</span>
                  </div>
                )}
                {analytics.roas && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ROAS</span>
                    <span className="text-sm font-medium text-gray-900">{analytics.roas.toFixed(2)}x</span>
                  </div>
                )}
                {analytics.cost_per_acquisition && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost per Acquisition</span>
                    <span className="text-sm font-medium text-gray-900">${analytics.cost_per_acquisition.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.show_rate_percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Show Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.total_shows} of {analytics.total_calls} calls
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analytics.close_rate_percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Close Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.total_closes} of {analytics.total_shows} shows
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.total_calls > 0 ? ((analytics.total_closes / analytics.total_calls) * 100).toFixed(1) : '0.0'}%
                </div>
                <div className="text-sm text-gray-600">Overall Conversion</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.total_closes} of {analytics.total_calls} total calls
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

