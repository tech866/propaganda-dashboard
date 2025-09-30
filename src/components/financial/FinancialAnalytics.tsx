'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { FinancialService, formatCurrency } from '@/lib/services/financialService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface FinancialAnalyticsProps {
  agencyId: string;
  onClose: () => void;
}

interface AnalyticsData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalRecords: number;
  revenueByMonth: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  expensesByType: Array<{ type: string; amount: number; percentage: number }>;
  paymentStatusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  topCampaigns: Array<{ campaign: string; revenue: number; expenses: number; profit: number }>;
  topClients: Array<{ client: string; revenue: number; expenses: number; profit: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function FinancialAnalytics({ agencyId, onClose }: FinancialAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');

  const financialService = new FinancialService(agencyId);

  useEffect(() => {
    loadAnalyticsData();
  }, [agencyId, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 6);
      }

      const records = await financialService.getFinancialRecords({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      // Process data for analytics
      const analyticsData = processAnalyticsData(records);
      setData(analyticsData);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (records: any[]): AnalyticsData => {
    const totalRevenue = records
      .filter(r => r.transaction_type === 'payment')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = records
      .filter(r => ['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(r.transaction_type))
      .reduce((sum, r) => sum + r.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    // Revenue by month
    const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {};
    records.forEach(record => {
      const month = new Date(record.transaction_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }
      
      if (record.transaction_type === 'payment') {
        monthlyData[month].revenue += record.amount;
      } else if (['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(record.transaction_type)) {
        monthlyData[month].expenses += record.amount;
      }
    });

    const revenueByMonth = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Expenses by type
    const expensesByType: { [key: string]: number } = {};
    records
      .filter(r => ['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(r.transaction_type))
      .forEach(record => {
        expensesByType[record.transaction_type] = (expensesByType[record.transaction_type] || 0) + record.amount;
      });

    const totalExpensesForPercentage = Object.values(expensesByType).reduce((sum, amount) => sum + amount, 0);
    const expensesByTypeArray = Object.entries(expensesByType).map(([type, amount]) => ({
      type: type.replace('_', ' '),
      amount,
      percentage: totalExpensesForPercentage > 0 ? (amount / totalExpensesForPercentage) * 100 : 0
    }));

    // Payment status breakdown
    const statusCounts: { [key: string]: number } = {};
    records.forEach(record => {
      statusCounts[record.payment_status] = (statusCounts[record.payment_status] || 0) + 1;
    });

    const totalRecords = records.length;
    const paymentStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalRecords > 0 ? (count / totalRecords) * 100 : 0
    }));

    // Top campaigns
    const campaignData: { [key: string]: { revenue: number; expenses: number } } = {};
    records.forEach(record => {
      const campaign = record.campaign_name || 'No Campaign';
      if (!campaignData[campaign]) {
        campaignData[campaign] = { revenue: 0, expenses: 0 };
      }
      
      if (record.transaction_type === 'payment') {
        campaignData[campaign].revenue += record.amount;
      } else if (['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(record.transaction_type)) {
        campaignData[campaign].expenses += record.amount;
      }
    });

    const topCampaigns = Object.entries(campaignData)
      .map(([campaign, data]) => ({
        campaign,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Top clients
    const clientData: { [key: string]: { revenue: number; expenses: number } } = {};
    records.forEach(record => {
      const client = record.client_name || 'No Client';
      if (!clientData[client]) {
        clientData[client] = { revenue: 0, expenses: 0 };
      }
      
      if (record.transaction_type === 'payment') {
        clientData[client].revenue += record.amount;
      } else if (['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(record.transaction_type)) {
        clientData[client].expenses += record.amount;
      }
    });

    const topClients = Object.entries(clientData)
      .map(([client, data]) => ({
        client,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalRecords,
      revenueByMonth,
      expensesByType: expensesByTypeArray,
      paymentStatusBreakdown,
      topCampaigns,
      topClients
    };
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Financial Analytics</DialogTitle>
            <DialogDescription>Loading financial analytics data...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !data) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Financial Analytics</DialogTitle>
            <DialogDescription>Error loading analytics data</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadAnalyticsData} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Analytics
            </span>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Comprehensive financial performance analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">From payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">Ad spend & fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.netProfit)}
                </div>
                <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalRecords}</div>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses Over Time</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expenses by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Type</CardTitle>
                <CardDescription>Breakdown of expense categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <RechartsPieChart
                      data={data.expensesByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {data.expensesByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RechartsPieChart>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Campaigns ranked by profit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topCampaigns.map((campaign, index) => (
                    <div key={campaign.campaign} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{campaign.campaign}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(campaign.revenue)} revenue, {formatCurrency(campaign.expenses)} expenses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${campaign.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(campaign.profit)}
                        </p>
                        <p className="text-xs text-muted-foreground">profit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Clients</CardTitle>
                <CardDescription>Clients ranked by profit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topClients.map((client, index) => (
                    <div key={client.client} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{client.client}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(client.revenue)} revenue, {formatCurrency(client.expenses)} expenses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${client.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(client.profit)}
                        </p>
                        <p className="text-xs text-muted-foreground">profit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Breakdown</CardTitle>
              <CardDescription>Distribution of payment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.paymentStatusBreakdown.map((status) => (
                  <div key={status.status} className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{status.count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{status.status}</p>
                    <p className="text-xs text-muted-foreground">{status.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
