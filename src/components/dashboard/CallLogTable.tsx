'use client';

import React, { useState, useEffect } from 'react';
import { Call } from '@/lib/services/callService';

interface CallLogTableProps {
  className?: string;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    userId?: string;
    callType?: string;
    status?: string;
    outcome?: string;
  };
}

interface CallLogTableState {
  calls: Call[];
  loading: boolean;
  error: string | null;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
}

const CallLogTable: React.FC<CallLogTableProps> = ({ className = '', filters }) => {
  const [state, setState] = useState<CallLogTableState>({
    calls: [],
    loading: true,
    error: null,
    sortField: 'created_at',
    sortDirection: 'desc',
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: ''
  });

  // Fetch calls data
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Build query parameters from filters
        const params = new URLSearchParams();
        params.append('limit', '100');
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.clientId) params.append('clientId', filters.clientId);
        if (filters?.userId) params.append('userId', filters.userId);
        
        const response = await fetch(`/api/calls?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch calls: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.success) {
          let filteredCalls = result.data;
          
          // Apply client-side filters for callType, status, outcome
          if (filters?.callType) {
            filteredCalls = filteredCalls.filter((call: Call) => call.call_type === filters.callType);
          }
          if (filters?.status) {
            filteredCalls = filteredCalls.filter((call: Call) => call.status === filters.status);
          }
          if (filters?.outcome) {
            filteredCalls = filteredCalls.filter((call: Call) => call.outcome === filters.outcome);
          }
          
          setState(prev => ({ ...prev, calls: filteredCalls, loading: false }));
        } else {
          throw new Error(result.message || 'Failed to fetch calls');
        }
      } catch (error) {
        console.error('Error fetching calls:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to fetch calls',
          loading: false 
        }));
      }
    };

    fetchCalls();
  }, [filters]);

  // Sort calls based on current sort field and direction
  const sortedCalls = React.useMemo(() => {
    const sorted = [...state.calls].sort((a, b) => {
      let aValue: any = a[state.sortField as keyof Call];
      let bValue: any = b[state.sortField as keyof Call];

      // Handle date fields
      if (state.sortField === 'created_at' || state.sortField === 'completed_at' || state.sortField === 'scheduled_at') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [state.calls, state.sortField, state.sortDirection]);

  // Filter calls based on search term
  const filteredCalls = React.useMemo(() => {
    if (!state.searchTerm) return sortedCalls;
    
    const searchLower = state.searchTerm.toLowerCase();
    return sortedCalls.filter(call => 
      call.prospect_name.toLowerCase().includes(searchLower) ||
      (call.prospect_email && call.prospect_email.toLowerCase().includes(searchLower)) ||
      (call.prospect_phone && call.prospect_phone.includes(searchTerm)) ||
      call.status.toLowerCase().includes(searchLower) ||
      call.outcome.toLowerCase().includes(searchLower) ||
      call.call_type.toLowerCase().includes(searchLower)
    );
  }, [sortedCalls, state.searchTerm]);

  // Paginate filtered calls
  const paginatedCalls = React.useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return filteredCalls.slice(startIndex, endIndex);
  }, [filteredCalls, state.currentPage, state.itemsPerPage]);

  // Handle sorting
  const handleSort = (field: string) => {
    setState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
      currentPage: 1 // Reset to first page when sorting
    }));
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      searchTerm: event.target.value,
      currentPage: 1 // Reset to first page when searching
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration for display
  const formatDuration = (duration: number | undefined) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get outcome badge color
  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'tbd': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get call type badge color
  const getCallTypeBadgeColor = (callType: string) => {
    switch (callType) {
      case 'inbound': return 'bg-blue-100 text-blue-800';
      case 'outbound': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredCalls.length / state.itemsPerPage);
  const startItem = (state.currentPage - 1) * state.itemsPerPage + 1;
  const endItem = Math.min(state.currentPage * state.itemsPerPage, filteredCalls.length);

  if (state.loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Call Logs</h3>
            <p className="text-gray-600">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Call Logs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {startItem}-{endItem} of {filteredCalls.length} calls
            </p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search calls..."
              value={state.searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prospect_name')}
              >
                <div className="flex items-center gap-1">
                  Prospect
                  {state.sortField === 'prospect_name' && (
                    <svg className={`w-4 h-4 ${state.sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('call_type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {state.sortField === 'call_type' && (
                    <svg className={`w-4 h-4 ${state.sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {state.sortField === 'status' && (
                    <svg className={`w-4 h-4 ${state.sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('outcome')}
              >
                <div className="flex items-center gap-1">
                  Outcome
                  {state.sortField === 'outcome' && (
                    <svg className={`w-4 h-4 ${state.sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('call_duration')}
              >
                <div className="flex items-center gap-1">
                  Duration
                  {state.sortField === 'call_duration' && (
                    <svg className={`w-4 h-4 ${state.sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Date
                  {state.sortField === 'created_at' && (
                    <svg className={`w-4 h-4 ${state.sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCalls.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No calls found</h3>
                    <p className="text-gray-600">
                      {state.searchTerm ? 'Try adjusting your search terms.' : 'No calls have been logged yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{call.prospect_name}</div>
                      {call.prospect_email && (
                        <div className="text-sm text-gray-500">{call.prospect_email}</div>
                      )}
                      {call.prospect_phone && (
                        <div className="text-sm text-gray-500">{call.prospect_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCallTypeBadgeColor(call.call_type)}`}>
                      {call.call_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(call.status)}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeBadgeColor(call.outcome)}`}>
                      {call.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(call.call_duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(call.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{filteredCalls.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === state.currentPage;
                const shouldShow = 
                  page === 1 || 
                  page === totalPages || 
                  (page >= state.currentPage - 1 && page <= state.currentPage + 1);
                
                if (!shouldShow) {
                  if (page === state.currentPage - 2 || page === state.currentPage + 2) {
                    return <span key={page} className="px-3 py-1 text-sm text-gray-500">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      isCurrentPage
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallLogTable;
