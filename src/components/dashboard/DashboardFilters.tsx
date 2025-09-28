'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  clientId: string;
  userId: string;
  callType: string;
  status: string;
  outcome: string;
}

export interface DashboardFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
  showAdvanced?: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onFiltersChange,
  className = '',
  showAdvanced = false
}) => {
  const { user, hasAnyRole } = useRole();
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    clientId: '',
    userId: '',
    callType: '',
    status: '',
    outcome: ''
  });

  const [clients, setClients] = useState<Array<{id: string, name: string}>>([]);
  const [users, setUsers] = useState<Array<{id: string, name: string, role: string}>>([]);
  const [loading, setLoading] = useState(false);

  // Load clients and users for filtering
  useEffect(() => {
    const loadFilterData = async () => {
      if (!hasAnyRole(['admin', 'ceo'])) return;

      setLoading(true);
      try {
        // Load clients
        const clientsResponse = await fetch('/api/clients');
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData.data || []);
        }

        // Load users
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data || []);
        }
      } catch (error) {
        console.error('Failed to load filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, [hasAnyRole]);

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      clientId: '',
      userId: '',
      callType: '',
      status: '',
      outcome: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range Filters */}
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="dateFrom"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="dateTo"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>

          {/* Client Filter - Only for Admin/CEO */}
          {hasAnyRole(['admin', 'ceo']) && (
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                id="clientId"
                value={filters.clientId}
                onChange={(e) => handleFilterChange('clientId', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                disabled={loading}
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Filter - Only for Admin/CEO */}
          {hasAnyRole(['admin', 'ceo']) && (
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                Sales User
              </label>
              <select
                id="userId"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                disabled={loading}
              >
                <option value="">All Users</option>
                {users
                  .filter(user => user.role === 'sales')
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvanced && (
            <>
              <div>
                <label htmlFor="callType" className="block text-sm font-medium text-gray-700 mb-1">
                  Call Type
                </label>
                <select
                  id="callType"
                  value={filters.callType}
                  onChange={(e) => handleFilterChange('callType', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="">All Types</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="no-show">No Show</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>

              <div>
                <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome
                </label>
                <select
                  id="outcome"
                  value={filters.outcome}
                  onChange={(e) => handleFilterChange('outcome', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="">All Outcomes</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="tbd">TBD</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Quick Filter Presets */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setFilters(prev => ({
                  ...prev,
                  dateFrom: lastWeek.toISOString().split('T')[0],
                  dateTo: today.toISOString().split('T')[0]
                }));
              }}
              className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                setFilters(prev => ({
                  ...prev,
                  dateFrom: lastMonth.toISOString().split('T')[0],
                  dateTo: today.toISOString().split('T')[0]
                }));
              }}
              className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
            >
              Last 30 days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setFilters(prev => ({
                  ...prev,
                  dateFrom: thisMonth.toISOString().split('T')[0],
                  dateTo: today.toISOString().split('T')[0]
                }));
              }}
              className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
            >
              This month
            </button>
            {hasAnyRole(['admin', 'ceo']) && (
              <button
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    clientId: user?.clientId || ''
                  }));
                }}
                className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
              >
                My client
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
