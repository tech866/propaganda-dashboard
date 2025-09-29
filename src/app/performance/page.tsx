'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Calendar,
  Filter,
  Download,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceMetrics {
  showRate: number;
  closeRate: number;
  totalCalls: number;
  completedCalls: number;
  wonCalls: number;
  avgCallDuration: number;
  conversionRate: number;
  revenue: number;
}

interface TrendData {
  date: string;
  showRate: number;
  closeRate: number;
  calls: number;
  revenue: number;
}

interface UserPerformance {
  userId: string;
  userName: string;
  showRate: number;
  closeRate: number;
  totalCalls: number;
  wonCalls: number;
  revenue: number;
}

interface ClientPerformance {
  clientId: string;
  clientName: string;
  showRate: number;
  closeRate: number;
  totalCalls: number;
  revenue: number;
  margin: number;
}

export default function PerformancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [clientPerformance, setClientPerformance] = useState<ClientPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPerformanceData();
    }
  }, [session, dateRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with actual API calls
      const mockMetrics: PerformanceMetrics = {
        showRate: 78.5,
        closeRate: 42.3,
        totalCalls: 1247,
        completedCalls: 978,
        wonCalls: 414,
        avgCallDuration: 18.5,
        conversionRate: 33.1,
        revenue: 2847291
      };

      const mockTrendData: TrendData[] = [
        { date: '2024-01', showRate: 72.1, closeRate: 38.5, calls: 89, revenue: 234567 },
        { date: '2024-02', showRate: 75.3, closeRate: 41.2, calls: 95, revenue: 267890 },
        { date: '2024-03', showRate: 78.9, closeRate: 43.7, calls: 102, revenue: 289123 },
        { date: '2024-04', showRate: 76.4, closeRate: 40.8, calls: 98, revenue: 256789 },
        { date: '2024-05', showRate: 79.2, closeRate: 44.1, calls: 105, revenue: 298765 },
        { date: '2024-06', showRate: 81.5, closeRate: 45.9, calls: 112, revenue: 312456 },
        { date: '2024-07', showRate: 78.5, closeRate: 42.3, calls: 108, revenue: 284729 }
      ];

      const mockUserPerformance: UserPerformance[] = [
        { userId: '1', userName: 'Sarah Johnson', showRate: 82.1, closeRate: 45.2, totalCalls: 156, wonCalls: 71, revenue: 456789 },
        { userId: '2', userName: 'Mike Chen', showRate: 75.8, closeRate: 41.7, totalCalls: 142, wonCalls: 59, revenue: 389234 },
        { userId: '3', userName: 'Emily Davis', showRate: 79.3, closeRate: 43.1, totalCalls: 138, wonCalls: 60, revenue: 412567 },
        { userId: '4', userName: 'David Wilson', showRate: 76.9, closeRate: 40.5, totalCalls: 134, wonCalls: 54, revenue: 367890 }
      ];

      const mockClientPerformance: ClientPerformance[] = [
        { clientId: '1', clientName: 'TechCorp Inc.', showRate: 85.2, closeRate: 48.7, totalCalls: 234, revenue: 892000, margin: 70.0 },
        { clientId: '2', clientName: 'StartupXYZ', showRate: 78.9, closeRate: 42.1, totalCalls: 198, revenue: 650000, margin: 68.5 },
        { clientId: '3', clientName: 'GlobalTech', showRate: 72.3, closeRate: 38.9, totalCalls: 167, revenue: 523000, margin: 65.2 },
        { clientId: '4', clientName: 'InnovateLab', showRate: 81.7, closeRate: 46.3, totalCalls: 189, revenue: 734000, margin: 72.1 }
      ];

      setMetrics(mockMetrics);
      setTrendData(mockTrendData);
      setUserPerformance(mockUserPerformance);
      setClientPerformance(mockClientPerformance);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Modern color palette using design system colors
  const COLORS = [
    'hsl(var(--primary))', // Primary blue
    'hsl(var(--success))', // Success green
    'hsl(var(--warning))', // Warning orange
    'hsl(var(--destructive))', // Destructive red
    'hsl(var(--secondary))', // Secondary purple
  ];

  if (loading) {
    return (
      <ModernDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading performance data...</div>
        </div>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-display">Performance Analytics</h1>
            <p className="text-body-lg text-muted-foreground mt-1">Advanced metrics and insights for your sales performance</p>
          </div>
          <div className="flex space-x-4">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="input-modern"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Show Rate</CardTitle>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatPercentage(metrics?.showRate || 0)}</div>
              <p className="text-xs mt-1 flex items-center text-success">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="ml-1">+2.4% vs last month</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Completed calls vs total scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Close Rate</CardTitle>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-success">
                <Target className="h-4 w-4 text-success-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatPercentage(metrics?.closeRate || 0)}</div>
              <p className="text-xs mt-1 flex items-center text-success">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="ml-1">+1.8% vs last month</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Won calls vs completed calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-warning">
                <Activity className="h-4 w-4 text-warning-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(metrics?.revenue || 0)}</div>
              <p className="text-xs mt-1 flex items-center text-success">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="ml-1">+12.3% vs last month</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Total revenue generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Call Duration</CardTitle>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-destructive">
                <Calendar className="h-4 w-4 text-destructive-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics?.avgCallDuration || 0}m</div>
              <p className="text-xs mt-1 flex items-center text-destructive">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="ml-1">-1.2m vs last month</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Average call duration</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h2">Performance Trends</CardTitle>
            <p className="text-body-sm text-muted-foreground">Show rate, close rate, and revenue trends over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="showRate" 
                    stroke={COLORS[0]} 
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: COLORS[0] }} 
                    name="Show Rate (%)"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="closeRate" 
                    stroke={COLORS[1]} 
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: COLORS[1] }} 
                    name="Close Rate (%)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS[2]} 
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: COLORS[2] }} 
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h2">User Performance</CardTitle>
            <p className="text-body-sm text-muted-foreground">Individual performance metrics by sales team member</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPerformance.map((user) => (
                <div key={user.userId} className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-sm">
                          {user.userName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{user.userName}</h3>
                        <p className="text-sm text-muted-foreground">{user.totalCalls} total calls</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{formatCurrency(user.revenue)}</div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Show Rate:</span>
                      <span className="ml-2 font-medium text-foreground">{formatPercentage(user.showRate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Close Rate:</span>
                      <span className="ml-2 font-medium text-foreground">{formatPercentage(user.closeRate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Won Calls:</span>
                      <span className="ml-2 font-medium text-foreground">{user.wonCalls}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h2">Client Performance</CardTitle>
            <p className="text-body-sm text-muted-foreground">Performance metrics by client account</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientPerformance.map((client) => (
                <div key={client.clientId} className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{client.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{client.totalCalls} total calls</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{formatCurrency(client.revenue)}</div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Show Rate:</span>
                      <span className="ml-2 font-medium text-foreground">{formatPercentage(client.showRate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Close Rate:</span>
                      <span className="ml-2 font-medium text-foreground">{formatPercentage(client.closeRate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Margin:</span>
                      <span className="ml-2 font-medium text-foreground">{formatPercentage(client.margin)}</span>
                    </div>
                    <div>
                      <Badge variant="success">
                        Excellent
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${client.margin}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernDashboardLayout>
  );
}
