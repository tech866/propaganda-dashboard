'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useAgency } from '@/contexts/AgencyContext';
import { performanceService, PerformanceFilters, PerformanceMetrics, TrendData, ConversionFunnelData, PerformanceBreakdown } from '@/lib/services/performanceService';
import { PerformanceMetricsCards } from './PerformanceMetricsCards';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { PerformanceBreakdownTable } from './PerformanceBreakdownTable';

export function PerformancePage() {
  const { userRole } = useRole();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive performance metrics and insights for {agency?.name || 'your agency'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Filters & Controls
          </CardTitle>
          <CardDescription>
            Customize your performance analysis with date ranges and dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Breakdown By</label>
              <Select value={selectedDimension} onValueChange={handleDimensionChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="time">Time Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Metric</label>
              <Select value={selectedMetric} onValueChange={handleMetricChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="adSpend">Ad Spend</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Cards */}
      {metrics && <PerformanceMetricsCards metrics={metrics} />}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Conversion Funnel
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Key performance indicators for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceService.formatCurrency(metrics?.totalRevenue || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceService.formatCurrency(metrics?.totalAdSpend || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Ad Spend</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {performanceService.formatCurrency(metrics?.totalProfit || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics?.roas.toFixed(2)}x
                    </div>
                    <div className="text-sm text-muted-foreground">ROAS</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <PerformanceTrendChart 
            data={trendData} 
            selectedMetric={selectedMetric}
            onMetricChange={handleMetricChange}
          />
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <ConversionFunnelChart data={funnelData} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <PerformanceBreakdownTable 
            data={breakdownData}
            dimension={selectedDimension}
            onDimensionChange={handleDimensionChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}