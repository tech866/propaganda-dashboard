'use client';

import React, { useState, useEffect } from 'react';
import { MetricsFilter } from '@/lib/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

interface AnalyticsFiltersProps {
  filters: MetricsFilter;
  onFiltersChange: (filters: Partial<MetricsFilter>) => void;
  workspaceId?: string;
  className?: string;
}

export default function AnalyticsFilters({ 
  filters, 
  onFiltersChange, 
  workspaceId,
  className = '' 
}: AnalyticsFiltersProps) {
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Predefined date ranges
  const dateRanges = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'Last 6 months', value: 180 },
    { label: 'Last year', value: 365 },
    { label: 'Custom range', value: 'custom' }
  ];

  useEffect(() => {
    if (workspaceId) {
      fetchUsers();
      fetchClients();
    }
  }, [workspaceId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleDateRangeChange = (range: string | number) => {
    if (range === 'custom') {
      // Don't set dates for custom range - let user select manually
      return;
    }

    const days = typeof range === 'number' ? range : 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    onFiltersChange({
      date_from: startDate.toISOString(),
      date_to: endDate.toISOString()
    });
  };

  const handleCustomDateChange = (field: 'date_from' | 'date_to', value: string) => {
    onFiltersChange({
      [field]: value ? new Date(value).toISOString() : undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      traffic_source: 'all',
      user_id: undefined,
      client_id: undefined,
      date_from: undefined,
      date_to: undefined
    });
  };

  const getCurrentDateRange = () => {
    if (!filters.date_from || !filters.date_to) return 'custom';
    
    const from = new Date(filters.date_from);
    const to = new Date(filters.date_to);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const matchingRange = dateRanges.find(range => 
      typeof range.value === 'number' && range.value === diffDays
    );
    
    return matchingRange ? matchingRange.value : 'custom';
  };

  return (
    <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Filter className="h-5 w-5" />
          Analytics Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Traffic Source Filter */}
          <div className="space-y-2">
            <Label htmlFor="traffic-source" className="text-foreground">Traffic Source</Label>
            <Select
              value={filters.traffic_source || 'all'}
              onValueChange={(value) => onFiltersChange({ traffic_source: value as 'organic' | 'meta' | 'all' })}
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-foreground">
                <SelectValue placeholder="Select traffic source" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="meta">Meta Ads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <Label htmlFor="user" className="text-foreground">Sales Rep</Label>
            <Select
              value={filters.user_id || 'all'}
              onValueChange={(value) => onFiltersChange({ user_id: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-foreground">
                <SelectValue placeholder="Select sales rep" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Sales Reps</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-foreground">Client</Label>
            <Select
              value={filters.client_id || 'all'}
              onValueChange={(value) => onFiltersChange({ client_id: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-foreground">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="date-range" className="text-foreground">Date Range</Label>
            <Select
              value={getCurrentDateRange().toString()}
              onValueChange={(value) => handleDateRangeChange(value === 'custom' ? 'custom' : parseInt(value))}
            >
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-foreground">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value.toString()}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range */}
        {getCurrentDateRange() === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-foreground">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.date_from ? new Date(filters.date_from).toISOString().split('T')[0] : ''}
                onChange={(e) => handleCustomDateChange('date_from', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-foreground">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.date_to ? new Date(filters.date_to).toISOString().split('T')[0] : ''}
                onChange={(e) => handleCustomDateChange('date_to', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-foreground"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-6">
          <Button
            onClick={clearFilters}
            variant="outline"
            className="bg-slate-700/50 border-slate-600 text-foreground hover:bg-slate-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {filters.traffic_source !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-900/50 text-blue-300 mr-2">
                {filters.traffic_source === 'organic' ? 'Organic' : 'Meta Ads'}
              </span>
            )}
            {filters.user_id && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-900/50 text-green-300 mr-2">
                User Filtered
              </span>
            )}
            {filters.client_id && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-900/50 text-purple-300 mr-2">
                Client Filtered
              </span>
            )}
            {(filters.date_from || filters.date_to) && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-900/50 text-yellow-300">
                <Calendar className="h-3 w-3 mr-1" />
                Date Filtered
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
