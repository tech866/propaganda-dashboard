'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useAgency } from '@/contexts/AgencyContext';
import { Badge } from '@/components/ui/badge';
import { performanceService, PerformanceFilters, PerformanceMetrics, TrendData, ConversionFunnelData, PerformanceBreakdown } from '@/lib/services/performanceService';
import { PerformanceMetricsCards } from './PerformanceMetricsCards';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { PerformanceBreakdownTable } from './PerformanceBreakdownTable';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';

export function PerformancePage() {
  const { user } = useRole();
  const { agency } = useAgency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnelData[]>([]);
  const [breakdownData, setBreakdownData] = useState<PerformanceBreakdown[]>([]);
  
  // Filter state
  const [filters, setFilters] = useState<PerformanceFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });
  const [selectedDimension, setSelectedDimension] = useState<'client' | 'user' | 'campaign' | 'time'>('client');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'adSpend' | 'profit' | 'conversions'>('revenue');

  // Load performance data
  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, trendDataResult, funnelDataResult, breakdownDataResult] = await Promise.all([
        performanceService.getPerformanceMetrics(filters),
        performanceService.getTrendData(filters),
        performanceService.getConversionFunnelData(filters),
        performanceService.getPerformanceBreakdown(selectedDimension, filters)
      ]);

      setMetrics(metricsData);
      setTrendData(trendDataResult);
      setFunnelData(funnelDataResult);
      setBreakdownData(breakdownDataResult);
    } catch (err) {
      console.error('Error loading performance data:', err);
      setError('Failed to load performance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    if (agency?.id) {
      loadPerformanceData();
    }
  }, [agency?.id, filters, selectedDimension]);

  // Handle filter changes
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleDimensionChange = (dimension: 'client' | 'user' | 'campaign' | 'time') => {
    setSelectedDimension(dimension);
  };

  const handleMetricChange = (metric: 'revenue' | 'adSpend' | 'profit' | 'conversions') => {
    setSelectedMetric(metric);
  };

  // Refresh data
  const handleRefresh = () => {
    loadPerformanceData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
            <p className="text-muted-foreground">Comprehensive performance metrics and insights</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
            <p className="text-muted-foreground">Comprehensive performance metrics and insights</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section - Mobile Responsive */}
        <header className="text-center mb-8 sm:mb-12" role="banner">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight px-4">
            Performance Analytics
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4">
            Comprehensive performance metrics and insights for {agency?.name || 'your agency'}
          </p>
        </header>

        {/* Enhanced Controls Section with Role-Based Features - Mobile Responsive */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          {/* Top row - Live data and role indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                <span className="text-sm text-gray-400">Live Data</span>
              </div>
              {/* Role-based access indicator */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`px-2 sm:px-3 py-1 text-xs font-medium ${
                    user?.role === 'ceo' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' :
                    user?.role === 'admin' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' :
                    user?.role === 'sales' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                    'bg-gray-500/20 text-gray-300 border-gray-500/50'
                  }`}
                >
                  {user?.role?.toUpperCase() || 'USER'}
                </Badge>
                <span className="text-xs text-gray-500 hidden sm:inline">
                  {user?.role === 'ceo' ? 'Full Access' :
                   user?.role === 'admin' ? 'Client Access' :
                   user?.role === 'sales' ? 'Personal Data' :
                   'Limited Access'}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Role-specific refresh button */}
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-105 flex-1 sm:flex-none"
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              {/* CEO-only features */}
              {user?.role === 'ceo' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-200 hover:scale-105 flex-1 sm:flex-none"
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Agency View</span>
                  <span className="sm:hidden">Agency</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:ring-offset-2 focus-within:ring-offset-slate-900">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-500/50 px-3 py-1 text-sm font-medium">
                Filters & Controls
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-400" />
              Analytics Controls
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Customize your performance analysis with date ranges and dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="hidden sm:inline">Start Date</span>
                  <span className="sm:hidden">Start</span>
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-slate-500/70 transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="hidden sm:inline">End Date</span>
                  <span className="sm:hidden">End</span>
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-slate-500/70 transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="hidden sm:inline">Breakdown By</span>
                  <span className="sm:hidden">Breakdown</span>
                </label>
                <Select value={selectedDimension} onValueChange={handleDimensionChange}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white hover:border-slate-500/70 focus:ring-blue-500/50 focus:border-blue-500 h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {/* Role-based breakdown options */}
                    {user?.role === 'ceo' && (
                      <SelectItem value="client" className="text-white hover:bg-slate-700 text-sm sm:text-base">Client</SelectItem>
                    )}
                    {(user?.role === 'ceo' || user?.role === 'admin') && (
                      <SelectItem value="user" className="text-white hover:bg-slate-700 text-sm sm:text-base">User</SelectItem>
                    )}
                    <SelectItem value="campaign" className="text-white hover:bg-slate-700 text-sm sm:text-base">Campaign</SelectItem>
                    <SelectItem value="time" className="text-white hover:bg-slate-700 text-sm sm:text-base">Time Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="hidden sm:inline">Primary Metric</span>
                  <span className="sm:hidden">Metric</span>
                </label>
                <Select value={selectedMetric} onValueChange={handleMetricChange}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white hover:border-slate-500/70 focus:ring-blue-500/50 focus:border-blue-500 h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="revenue" className="text-white hover:bg-slate-700 text-sm sm:text-base">Revenue</SelectItem>
                    {/* Financial metrics only for admin/ceo */}
                    {(user?.role === 'admin' || user?.role === 'ceo') && (
                      <>
                        <SelectItem value="adSpend" className="text-white hover:bg-slate-700 text-sm sm:text-base">Ad Spend</SelectItem>
                        <SelectItem value="profit" className="text-white hover:bg-slate-700 text-sm sm:text-base">Profit</SelectItem>
                      </>
                    )}
                    <SelectItem value="conversions" className="text-white hover:bg-slate-700 text-sm sm:text-base">Conversions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Role-specific data scope indicator */}
            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                <span className="text-sm text-gray-300 font-medium">Data Scope:</span>
                <span className="text-sm text-gray-400">
                  {user?.role === 'ceo' ? 'All clients and users across the agency' :
                   user?.role === 'admin' ? `Client: ${agency?.name || 'Your Client'} - All users` :
                   user?.role === 'sales' ? `Personal data only - ${user.name || 'Your Account'}` :
                   'Limited access'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Performance Metrics Cards */}
      {metrics && <PerformanceMetricsCards metrics={metrics} />}

        {/* Enhanced Main Content Tabs - Mobile Responsive */}
        <Tabs defaultValue="overview" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-1 rounded-lg sm:rounded-xl gap-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all duration-200 hover:bg-slate-700/50 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trends" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all duration-200 hover:bg-slate-700/50 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Trends</span>
              <span className="sm:hidden">Trends</span>
            </TabsTrigger>
            <TabsTrigger 
              value="funnel" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all duration-200 hover:bg-slate-700/50 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
            >
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Conversion Funnel</span>
              <span className="sm:hidden">Funnel</span>
            </TabsTrigger>
            <TabsTrigger 
              value="breakdown" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 transition-all duration-200 hover:bg-slate-700/50 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{user?.role === 'ceo' ? 'Agency' : user?.role === 'admin' ? 'Client' : 'Personal'} Breakdown</span>
              <span className="sm:hidden">{user?.role === 'ceo' ? 'Agency' : user?.role === 'admin' ? 'Client' : 'Personal'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-8">
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                    <Badge variant="outline" className="bg-green-600/20 text-green-300 border-green-500/50 px-3 py-1 text-sm font-medium">
                      Key Metrics
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                    Performance Summary
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Key performance indicators for the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-200 hover:scale-105">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {performanceService.formatCurrency(metrics?.totalRevenue || 0)}
                      </div>
                      <div className="text-sm text-gray-300 font-medium">Total Revenue</div>
                      <div className="text-xs text-gray-400 mt-1">Primary KPI</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 hover:scale-105">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {performanceService.formatCurrency(metrics?.totalAdSpend || 0)}
                      </div>
                      <div className="text-sm text-gray-300 font-medium">Total Ad Spend</div>
                      <div className="text-xs text-gray-400 mt-1">Investment</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:scale-105">
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {performanceService.formatCurrency(metrics?.totalProfit || 0)}
                      </div>
                      <div className="text-sm text-gray-300 font-medium">Total Profit</div>
                      <div className="text-xs text-gray-400 mt-1">Net Result</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-200 hover:scale-105">
                      <div className="text-3xl font-bold text-orange-400 mb-2">
                        {metrics?.roas.toFixed(2)}x
                      </div>
                      <div className="text-sm text-gray-300 font-medium">ROAS</div>
                      <div className="text-xs text-gray-400 mt-1">Efficiency</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-8">
            <PerformanceTrendChart 
              data={trendData} 
              selectedMetric={selectedMetric}
              onMetricChange={handleMetricChange}
            />
          </TabsContent>

          <TabsContent value="funnel" className="space-y-8">
            <ConversionFunnelChart data={funnelData} />
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-8">
            <PerformanceBreakdownTable 
              data={breakdownData}
              dimension={selectedDimension}
              onDimensionChange={handleDimensionChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ModernDashboardLayout>
  );
}