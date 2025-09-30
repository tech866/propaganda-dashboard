'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Eye,
  MousePointer,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  Client, 
  formatCurrency,
  formatDate,
  getClientStatusColor,
  getClientStatusIcon
} from '@/lib/services/clientService';

interface ClientPerformanceDashboardProps {
  client: Client;
}

export function ClientPerformanceDashboard({ client }: ClientPerformanceDashboardProps) {
  // Mock performance data - in real app, this would come from API
  const performanceData = {
    totalSpend: 125000,
    totalRevenue: 180000,
    totalProfit: 55000,
    roas: 1.44,
    impressions: 2500000,
    clicks: 125000,
    conversions: 2500,
    ctr: 5.0,
    conversionRate: 2.0,
    cpc: 1.0,
    cpa: 50.0,
    trends: {
      spend: { value: 12.5, direction: 'up' as const },
      revenue: { value: 8.3, direction: 'up' as const },
      profit: { value: 15.2, direction: 'up' as const },
      roas: { value: -2.1, direction: 'down' as const }
    }
  };

  const metrics = [
    {
      title: 'Total Spend',
      value: formatCurrency(performanceData.totalSpend),
      trend: performanceData.trends.spend,
      icon: DollarSign,
      description: 'Total advertising spend'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(performanceData.totalRevenue),
      trend: performanceData.trends.revenue,
      icon: TrendingUp,
      description: 'Revenue generated'
    },
    {
      title: 'Total Profit',
      value: formatCurrency(performanceData.totalProfit),
      trend: performanceData.trends.profit,
      icon: Target,
      description: 'Net profit margin'
    },
    {
      title: 'ROAS',
      value: performanceData.roas.toFixed(2),
      trend: performanceData.trends.roas,
      icon: BarChart3,
      description: 'Return on ad spend'
    }
  ];

  const engagementMetrics = [
    {
      title: 'Impressions',
      value: performanceData.impressions.toLocaleString(),
      icon: Eye,
      description: 'Total ad impressions'
    },
    {
      title: 'Clicks',
      value: performanceData.clicks.toLocaleString(),
      icon: MousePointer,
      description: 'Total clicks received'
    },
    {
      title: 'Conversions',
      value: performanceData.conversions.toLocaleString(),
      icon: Target,
      description: 'Total conversions'
    },
    {
      title: 'CTR',
      value: `${performanceData.ctr}%`,
      icon: TrendingUp,
      description: 'Click-through rate'
    },
    {
      title: 'Conversion Rate',
      value: `${performanceData.conversionRate}%`,
      icon: Users,
      description: 'Conversion rate'
    },
    {
      title: 'CPC',
      value: formatCurrency(performanceData.cpc),
      icon: DollarSign,
      description: 'Cost per click'
    },
    {
      title: 'CPA',
      value: formatCurrency(performanceData.cpa),
      icon: Target,
      description: 'Cost per acquisition'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{client.name}</CardTitle>
                <CardDescription className="text-lg">{client.company}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={getClientStatusColor(client.status)}
                  >
                    {getClientStatusIcon(client.status)} {client.status}
                  </Badge>
                  {client.industry && (
                    <Badge variant="outline">{client.industry}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Performance Period</p>
              <p className="font-medium">Last 30 Days</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend.direction === 'up';
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(metric.trend.value)}%
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Engagement Metrics
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for {client.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {engagementMetrics.map((metric, index) => {
              const Icon = metric.icon;
              
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-semibold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>
              Key performance indicators and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profit Margin</span>
              <span className="text-sm font-semibold">
                {((performanceData.totalProfit / performanceData.totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Revenue Growth</span>
              <span className="text-sm font-semibold text-green-600">
                +{performanceData.trends.revenue.value}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Spend Efficiency</span>
              <span className="text-sm font-semibold text-green-600">
                +{performanceData.trends.spend.value}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ROAS Trend</span>
              <span className="text-sm font-semibold text-red-600">
                {performanceData.trends.roas.value}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common actions for this client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export Performance Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Set Performance Goals
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Performance Review
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Notes</CardTitle>
          <CardDescription>
            Key insights and recommendations for {client.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Strong Performance</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Revenue and profit are trending upward with a healthy ROAS of {performanceData.roas.toFixed(2)}. 
                The client is performing well above industry benchmarks.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Optimization Opportunity</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                While ROAS is strong, there's a slight downward trend. Consider reviewing ad creative 
                and targeting to maintain performance levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}