'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroMetrics from '@/components/dashboard/HeroMetrics';
import LossReasonsChart from '@/components/dashboard/LossReasonsChart';
import CallLogTable from '@/components/dashboard/CallLogTable';
import DashboardFilters, { FilterState } from '@/components/dashboard/DashboardFilters';
import DashboardNavigation from '@/components/navigation/DashboardNavigation';
import { useRole, RoleGuard, PermissionGuard } from '@/contexts/RoleContext';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, hasAnyRole, canViewMetrics, canManageUsers, canViewAuditLogs } = useRole();
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    clientId: '',
    userId: '',
    callType: '',
    status: '',
    outcome: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Propaganda Dashboard</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {session.user?.role?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <DashboardNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Filters */}
        <DashboardFilters 
          onFiltersChange={handleFiltersChange}
          className="mb-8"
          showAdvanced={hasAnyRole(['admin', 'ceo'])}
        />

        {/* Hero Metrics - Only show if user can view metrics */}
        <PermissionGuard permission="view_own_metrics">
          <HeroMetrics className="mb-8" filters={filters} />
        </PermissionGuard>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/calls/new"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Log New Call
                </Link>
                <Link
                  href="/calls"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-md font-medium transition-colors"
                >
                  View All Calls
                </Link>
                {canManageUsers && (
                  <Link
                    href="/admin/users/new"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-md font-medium transition-colors"
                  >
                    Add New User
                  </Link>
                )}
                {canViewAuditLogs && (
                  <Link
                    href="/audit"
                    className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-md font-medium transition-colors"
                  >
                    View Audit Logs
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Account Information</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{session.user?.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Client ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{session.user?.clientId}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Loss Reasons Chart - Only show if user can view metrics */}
        <PermissionGuard permission="view_own_metrics">
          <LossReasonsChart className="mt-8" />
        </PermissionGuard>

        {/* Call Log Table - Only show if user can view calls */}
        <PermissionGuard permission="view_own_calls">
          <CallLogTable className="mt-8" filters={filters} />
        </PermissionGuard>
      </main>
    </div>
  );
}