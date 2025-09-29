'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import ModernLineChart from '@/components/dashboard/ModernLineChart';
import { 
  FunnelIcon, 
  DownloadIcon, 
  RefreshCw, 
  CalendarIcon,
  DollarSign,
  CreditCard,
  Users,
  Target,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // KPI Data
  const kpiData = [
    {
      title: 'Ad Spend',
      value: '$847,293',
      delta: { value: '+8.2%', trend: 'up' as const },
      description: 'Total advertising expenditure',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: 'Cash Collected',
      value: '$2,234,891',
      delta: { value: '+15.3%', trend: 'up' as const },
      description: 'Actual payments received',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      title: 'Average Order Value',
      value: '$4,892',
      delta: { value: '-2.1%', trend: 'down' as const },
      description: 'Mean transaction value',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'ROAS (Return on Ad Spend)',
      value: '3.36x',
      delta: { value: '+0.24x', trend: 'up' as const },
      description: 'Return on ad spend',
      icon: <Target className="h-5 w-5" />
    }
  ];

  // Client P&L Data
  const clientData = [
    {
      name: 'TechCorp Inc.',
      status: 'excellent',
      revenue: '$892k',
      adSpend: '$268k',
      margin: '70.0%',
      total: '$624,400',
      progress: 70,
    },
    {
      name: 'StartupXYZ',
      status: 'excellent',
      revenue: '$650k',
      adSpend: '$195k',
      margin: '70.0%',
      total: '$457,800',
      progress: 70,
    },
  ];

  return (
    <ModernDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insights and Financial Performance</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Comprehensive overview of your advertising performance and revenue metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm">
              {session?.user?.role?.toUpperCase() || 'USER'}
            </Badge>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Time Period</label>
                <div className="relative">
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>This month</option>
                    <option>Last quarter</option>
                  </select>
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FunnelIcon className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                {kpi.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">
                  {kpi.delta && (
                    <span className={`inline-flex items-center gap-1 ${
                      kpi.delta.trend === 'up' ? 'text-green-600' : 
                      kpi.delta.trend === 'down' ? 'text-red-600' : 
                      'text-muted-foreground'
                    }`}>
                      {kpi.delta.trend === 'up' && '▲'}
                      {kpi.delta.trend === 'down' && '▼'}
                      {kpi.delta.value}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <ModernLineChart 
            title="Revenue and Profit Trends"
            description="Monthly performance over the past year"
          />

          {/* Quick Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Metrics</CardTitle>
              <CardDescription>Key performance indicators at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Conversion Rate</p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">3.2%</p>
                  <p className="text-xs text-green-600">+0.5% vs prev</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cost Per Lead</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$45</p>
                  <p className="text-xs text-red-600">-$3 vs prev</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client P&L Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Client P&L Summary</CardTitle>
            <CardDescription>Profit and loss breakdown by client</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Ad Spend</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientData.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <Badge variant="success">{client.status}</Badge>
                    </TableCell>
                    <TableCell>{client.revenue}</TableCell>
                    <TableCell>{client.adSpend}</TableCell>
                    <TableCell>{client.margin}</TableCell>
                    <TableCell className="text-right font-semibold">{client.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModernDashboardLayout>
  );
}