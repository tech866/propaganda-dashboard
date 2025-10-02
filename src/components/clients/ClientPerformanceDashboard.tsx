'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Phone, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Client } from '@/lib/services/clientService';
import { EnhancedMetricsService, EnhancedCalculationResult } from '@/lib/services/enhancedMetricsService';
import { performanceService } from '@/lib/services/performanceService';

interface ClientPerformanceDashboardProps {
  client: Client;
  onClose?: () => void;
}

interface PerformanceFilters {
  dateRange: {
    start: string;
    end: string;
  };
  clientId?: string;
  userId?: string;
}

export default function ClientPerformanceDashboard({ client, onClose }: ClientPerformanceDashboardProps) {
  const [performanceData, setPerformanceData] = useState<EnhancedCalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  // Initialize performance service
  const performanceService = useMemo(() => new PerformanceService(), []);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    if (!client?.id) return;

    try {
      setLoading(true);
      setError(null);

      const filters = {
        clientId: client.id,
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
        adSpend: 0
      };

      const data = await EnhancedMetricsService.getEnhancedMetrics(filters);
      setPerformanceData(data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setError('Failed to load performance data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [client?.id, dateRange]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get trend icon and color
  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-400" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  // Get trend color
  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="text-white text-lg font-medium">Loading Performance Data...</div>
              <div className="text-gray-400 text-sm mt-2">Fetching metrics for {client.name}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-300">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Error Loading Performance Data</p>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchPerformanceData}
                  className="ml-auto bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Performance Dashboard
              </h1>
              <p className="text-lg text-gray-400 mt-2">
                Comprehensive analytics for <span className="text-blue-400 font-medium">{client.name}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white transition-all duration-200 hover:scale-105"
              onClick={fetchPerformanceData}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
            </Button>
            {onClose && (
              <Button 
                variant="outline" 
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white transition-all duration-200 hover:scale-105"
                onClick={onClose}
              >
                <Eye className="mr-2 h-4 w-4" /> Back to Client
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Filters & Controls</CardTitle>
                <CardDescription className="text-gray-400">Customize your performance view</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Metric View</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="revenue">Revenue Analysis</SelectItem>
                    <SelectItem value="conversion">Conversion Metrics</SelectItem>
                    <SelectItem value="roas">ROAS Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={fetchPerformanceData}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                >
                  <Filter className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        {performanceData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
          </div>
        </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(performanceData.revenue.totalRevenue)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(0)}
                  <span className="text-xs text-gray-400">vs previous period</span>
                </div>
              </CardContent>
      </Card>

            {/* Total Calls */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Calls</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {performanceData.enhancedCloseRate.totalCalls}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(0)}
                  <span className="text-xs text-gray-400">calls processed</span>
                </div>
              </CardContent>
            </Card>

            {/* Close Rate */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Close Rate</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatPercentage(performanceData.enhancedCloseRate.percentage)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(0)}
                  <span className="text-xs text-gray-400">conversion rate</span>
                </div>
              </CardContent>
            </Card>

            {/* ROAS */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">ROAS</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
      </div>
        </CardHeader>
        <CardContent>
                <div className="text-2xl font-bold text-white">
                  {performanceData.roas?.roas ? performanceData.roas.roas.toFixed(2) : 'N/A'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(0)}
                  <span className="text-xs text-gray-400">return on ad spend</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Metrics */}
        {performanceData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Revenue Analysis</CardTitle>
                    <CardDescription className="text-gray-400">Financial performance breakdown</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(performanceData.revenue.totalRevenue)}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-sm text-gray-400 mb-1">Average Order Value</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatCurrency(performanceData.aov?.averageOrderValue || 0)}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="text-sm text-gray-400 mb-1">Revenue per Call</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatCurrency(performanceData.revenue.totalRevenue / Math.max(performanceData.enhancedCloseRate.totalCalls, 1))}
                  </div>
          </div>
        </CardContent>
      </Card>

            {/* Conversion Metrics */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Conversion Metrics</CardTitle>
                    <CardDescription className="text-gray-400">Call and conversion performance</CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-sm text-gray-400 mb-1">Total Calls</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {performanceData.enhancedCloseRate.totalCalls}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-sm text-gray-400 mb-1">Completed Calls</div>
                    <div className="text-2xl font-bold text-green-400">
                      {performanceData.enhancedCloseRate.completedCalls}
                    </div>
            </div>
            </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="text-sm text-gray-400 mb-1">Close Rate</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatPercentage(performanceData.enhancedCloseRate.percentage)}
            </div>
            </div>
          </CardContent>
        </Card>
          </div>
        )}

        {/* Performance Summary */}
        {performanceData && (
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Performance Summary</CardTitle>
                  <CardDescription className="text-gray-400">
                    Comprehensive overview for {client.name} from {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
            </CardDescription>
      </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatCurrency(performanceData.revenue.totalRevenue)}
                  </div>
                  <div className="text-sm text-gray-400">Total Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {performanceData.enhancedCloseRate.totalCalls}
                  </div>
                  <div className="text-sm text-gray-400">Total Calls Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatPercentage(performanceData.enhancedCloseRate.percentage)}
                  </div>
                  <div className="text-sm text-gray-400">Overall Close Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
        )}
      </div>
    </div>
  );
}