'use client';

import React, { useState, useEffect } from 'react';
import { Call } from '@/lib/services/callService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

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

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'no-show': return 'destructive';
      case 'rescheduled': return 'warning';
      default: return 'muted';
    }
  };

  // Get outcome badge variant
  const getOutcomeBadgeVariant = (outcome: string) => {
    switch (outcome) {
      case 'won': return 'success';
      case 'lost': return 'destructive';
      case 'tbd': return 'muted';
      default: return 'muted';
    }
  };

  // Get call type badge variant
  const getCallTypeBadgeVariant = (callType: string) => {
    switch (callType) {
      case 'inbound': return 'info';
      case 'outbound': return 'default';
      default: return 'muted';
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredCalls.length / state.itemsPerPage);
  const startItem = (state.currentPage - 1) * state.itemsPerPage + 1;
  const endItem = Math.min(state.currentPage * state.itemsPerPage, filteredCalls.length);

  if (state.loading) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="animate-pulse">
            <div className="h-6 bg-muted/20 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.error) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="text-center">
            <div className="text-destructive mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-h4 mb-1">Error Loading Call Logs</h3>
            <p className="text-muted-foreground mb-4">{state.error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Call Logs</CardTitle>
            <CardDescription>
              Showing {startItem}-{endItem} of {filteredCalls.length} calls
            </CardDescription>
          </div>
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search calls..."
              value={state.searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('prospect_name')}
              >
                <div className="flex items-center gap-1">
                  Prospect
                  {state.sortField === 'prospect_name' && (
                    state.sortDirection === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('call_type')}
              >
                <div className="flex items-center gap-1">
                  Type
                  {state.sortField === 'call_type' && (
                    state.sortDirection === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {state.sortField === 'status' && (
                    state.sortDirection === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('outcome')}
              >
                <div className="flex items-center gap-1">
                  Outcome
                  {state.sortField === 'outcome' && (
                    state.sortDirection === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('call_duration')}
              >
                <div className="flex items-center gap-1">
                  Duration
                  {state.sortField === 'call_duration' && (
                    state.sortDirection === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Date
                  {state.sortField === 'created_at' && (
                    state.sortDirection === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-h4 mb-1">No calls found</h3>
                    <p className="text-muted-foreground">
                      {state.searchTerm ? 'Try adjusting your search terms.' : 'No calls have been logged yet.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCalls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{call.prospect_name}</div>
                      {call.prospect_email && (
                        <div className="text-sm text-muted-foreground">{call.prospect_email}</div>
                      )}
                      {call.prospect_phone && (
                        <div className="text-sm text-muted-foreground">{call.prospect_phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCallTypeBadgeVariant(call.call_type) as any}>
                      {call.call_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(call.status) as any}>
                      {call.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOutcomeBadgeVariant(call.outcome) as any}>
                      {call.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDuration(call.call_duration)}
                  </TableCell>
                  <TableCell>
                    {formatDate(call.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-body-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
                <span className="font-medium text-foreground">{endItem}</span> of{' '}
                <span className="font-medium text-foreground">{filteredCalls.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
              >
                Previous
              </Button>
              
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
                    return <span key={page} className="px-3 py-1 text-sm text-muted-foreground">...</span>;
                  }
                  return null;
                }
                
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CallLogTable;
