'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRole, RoleGuard, PermissionGuard } from '@/contexts/RoleContext';
import DashboardNavigation from '@/components/navigation/DashboardNavigation';
import Link from 'next/link';

interface LossReason {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LossReasonsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { user, hasAnyRole, canManageLossReasons } = useRole();
  
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (!hasAnyRole(['admin', 'ceo'])) {
      router.push('/dashboard');
    }
  }, [status, router, hasAnyRole]);

  useEffect(() => {
    if (hasAnyRole(['admin', 'ceo'])) {
      fetchLossReasons();
    }
  }, [hasAnyRole]);

  const fetchLossReasons = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For now, we'll use mock data since we don't have a loss reasons API yet
      // TODO: Replace with actual API call when available
      const mockLossReasons: LossReason[] = [
        {
          id: '1',
          name: 'Not Interested',
          description: 'Prospect expressed no interest in the product or service',
          category: 'Interest Level',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Budget Constraints',
          description: 'Prospect cannot afford the product or service',
          category: 'Financial',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '3',
          name: 'Timing Not Right',
          description: 'Prospect is interested but timing is not suitable',
          category: 'Timing',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '4',
          name: 'Competitor Chosen',
          description: 'Prospect chose a competitor instead',
          category: 'Competition',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '5',
          name: 'No Decision Maker',
          description: 'Could not reach the decision maker',
          category: 'Process',
          isActive: false,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ];
      
      setLossReasons(mockLossReasons);
    } catch (err) {
      console.error('Failed to fetch loss reasons:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch loss reasons');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLossReason = async (lossReasonId: string) => {
    if (!confirm('Are you sure you want to delete this loss reason? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Replace with actual API call when available
      setLossReasons(prev => prev.filter(reason => reason.id !== lossReasonId));
    } catch (err) {
      console.error('Failed to delete loss reason:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete loss reason');
    }
  };

  const handleToggleLossReasonStatus = async (lossReasonId: string, currentStatus: boolean) => {
    try {
      // TODO: Replace with actual API call when available
      setLossReasons(prev => prev.map(reason => 
        reason.id === lossReasonId 
          ? { ...reason, isActive: !currentStatus }
          : reason
      ));
    } catch (err) {
      console.error('Failed to update loss reason status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update loss reason status');
    }
  };

  // Filter loss reasons based on search term, category, and status
  const filteredLossReasons = lossReasons.filter(reason => {
    const matchesSearch = reason.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reason.description && reason.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || reason.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && reason.isActive) ||
                         (statusFilter === 'inactive' && !reason.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(lossReasons.map(reason => reason.category)));

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAnyRole(['admin', 'ceo'])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <DashboardNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loss Reasons Management</h1>
              <p className="mt-2 text-gray-600">
                Configure and manage loss reason categories for call tracking
              </p>
            </div>
            <Link
              href="/admin/loss-reasons/new"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Add New Reason
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reasons
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchLossReasons}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Loss Reasons Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading loss reasons...</p>
            </div>
          ) : filteredLossReasons.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No loss reasons found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLossReasons.map((reason) => (
                    <tr key={reason.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reason.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {reason.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {reason.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleLossReasonStatus(reason.id, reason.isActive)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reason.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {reason.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reason.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/loss-reasons/${reason.id}/edit`}
                            className="text-red-600 hover:text-red-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteLossReason(reason.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-500">
          Showing {filteredLossReasons.length} of {lossReasons.length} loss reasons
        </div>
      </main>
    </div>
  );
}
