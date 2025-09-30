'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Target,
  Users,
  Calendar,
  Download,
  Filter,
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

interface ClientAnalyticsProps {
  client: Client;
}

export function ClientAnalytics({ client }: ClientAnalyticsProps) {
  // Mock analytics data - in real app, this would come from API
  const analyticsData = {
    timeRange: '30d',
    totalSessions: 125000,
    totalUsers: 85000,
    bounceRate: 35.2,
    avgSessionDuration: '2m 45s',
    pageViews: 180000,
    conversionFunnel: {
      visitors: 100000,
      leads: 15000,
      qualified: 8500,
      customers: 2500
    },
    trafficSources: [
      { source: 'Google Ads', percentage: 45, sessions: 56250 },
      { source: 'Facebook', percentage: 25, sessions: 31250 },
      { source: 'Organic', percentage: 15, sessions: 18750 },
      { source: 'Direct', percentage: 10, sessions: 12500 },
      { source: 'Email', percentage: 5, sessions: 6250 }
    ],
    deviceBreakdown: [
      { device: 'Desktop', percentage: 55, sessions: 68750 },
      { device: 'Mobile', percentage: 35, sessions: 43750 },
      { device: 'Tablet', percentage: 10, sessions: 12500 }
    ],
    geographicData: [
      { location: 'United States', percentage: 60, sessions: 75000 },
      { location: 'Canada', percentage: 20, sessions: 25000 },
      { location: 'United Kingdom', percentage: 10, sessions: 12500 },
      { location: 'Australia', percentage: 5, sessions: 6250 },
      { location: 'Other', percentage: 5, sessions: 6250 }
    ],
    trends: {
      sessions: { value: 12.5, direction: 'up' as const },
      users: { value: 8.3, direction: 'up' as const },
      bounceRate: { value: -5.2, direction: 'down' as const },
      conversionRate: { value: 15.2, direction: 'up' as const }
    }
  };

  const keyMetrics = [
    {
      title: 'Total Sessions',
      value: analyticsData.totalSessions.toLocaleString(),
      trend: analyticsData.trends.sessions,
      icon: Activity,
      description: 'Website sessions'
    },
    {
      title: 'Total Users',
      value: analyticsData.totalUsers.toLocaleString(),
      trend: analyticsData.trends.users,
      icon: Users,
      description: 'Unique users'
    },
    {
      title: 'Bounce Rate',
      value: `${analyticsData.bounceRate}%`,
      trend: analyticsData.trends.bounceRate,
      icon: TrendingDown,
      description: 'Single-page sessions'
    },
    {
      title: 'Avg. Session Duration',
      value: analyticsData.avgSessionDuration,
      trend: { value: 8.5, direction: 'up' as const },
      icon: Calendar,
      description: 'Average time on site'
    }
  ];

  const conversionSteps = [
    { step: 'Visitors', count: analyticsData.conversionFunnel.visitors, percentage: 100 },
    { step: 'Leads', count: analyticsData.conversionFunnel.leads, percentage: 15 },
    { step: 'Qualified', count: analyticsData.conversionFunnel.qualified, percentage: 8.5 },
    { step: 'Customers', count: analyticsData.conversionFunnel.customers, percentage: 2.5 }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
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
                <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
                <CardDescription className="text-lg">{client.name} - {client.company}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={getClientStatusColor(client.status)}
                  >
                    {getClientStatusIcon(client.status)} {client.status}
                  </Badge>
                  <Badge variant="outline">Analytics</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="30d">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
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

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>
            Customer journey from visitor to customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionSteps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{step.step}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{step.count.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">({step.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
                {index < conversionSteps.length - 1 && (
                  <div className="text-xs text-muted-foreground text-center">
                    {((step.count - conversionSteps[index + 1].count) / step.count * 100).toFixed(1)}% drop-off
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>
              Where your visitors are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{source.sessions.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">({source.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Device Breakdown
            </CardTitle>
            <CardDescription>
              How users access your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.deviceBreakdown.map((device, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{device.device}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{device.sessions.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">({device.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Where your users are located
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.geographicData.map((location, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location.location}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{location.sessions.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">({location.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${location.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Insights</CardTitle>
          <CardDescription>
            Key insights and recommendations for {client.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Strong Traffic Growth</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Sessions and users are trending upward with {analyticsData.trends.sessions.value}% and {analyticsData.trends.users.value}% 
                growth respectively. The client is successfully driving more traffic to their campaigns.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Conversion Optimization</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The conversion funnel shows a {((analyticsData.conversionFunnel.visitors - analyticsData.conversionFunnel.customers) / analyticsData.conversionFunnel.visitors * 100).toFixed(1)}% 
                overall drop-off rate. Focus on improving the lead qualification stage to increase customer conversion.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Traffic Source Diversification</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Google Ads accounts for {analyticsData.trafficSources[0].percentage}% of traffic. Consider diversifying 
                traffic sources to reduce dependency and improve overall campaign resilience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}