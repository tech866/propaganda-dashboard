'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FinancialService, formatCurrency } from '@/lib/services/financialService';

interface FinancialReportsProps {
  agencyId: string;
}

interface ReportData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalRecords: number;
    profitMargin: number;
  };
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    recordCount: number;
  }>;
  campaignPerformance: Array<{
    campaign: string;
    revenue: number;
    expenses: number;
    profit: number;
    roi: number;
  }>;
  clientPerformance: Array<{
    client: string;
    revenue: number;
    expenses: number;
    profit: number;
    recordCount: number;
  }>;
  expenseBreakdown: Array<{
    type: string;
    amount: number;
    percentage: number;
  }>;
}

export function FinancialReports({ agencyId }: FinancialReportsProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  const financialService = new FinancialService(agencyId);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      generateReport();
    }
  }, [agencyId, dateRange, reportType]);

  const generateReport = async () => {
    if (!dateRange.from || !dateRange.to) return;

    setLoading(true);
    setError(null);
    try {
      const records = await financialService.getFinancialRecords({
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0]
      });

      const data = processReportData(records);
      setReportData(data);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (records: any[]): ReportData => {
    const totalRevenue = records
      .filter(r => r.transaction_type === 'payment')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = records
      .filter(r => ['ad_spend', 'fee'].includes(r.transaction_type))
      .reduce((sum, r) => sum + r.amount, 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Monthly breakdown
    const monthlyData: { [key: string]: { revenue: number; expenses: number; recordCount: number } } = {};
    records.forEach(record => {
      const month = new Date(record.transaction_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0, recordCount: 0 };
      }
      
      monthlyData[month].recordCount++;
      
      if (record.transaction_type === 'payment') {
        monthlyData[month].revenue += record.amount;
      } else if (['ad_spend', 'fee'].includes(record.transaction_type)) {
        monthlyData[month].expenses += record.amount;
      }
    });

    const monthlyBreakdown = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
      recordCount: data.recordCount
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Campaign performance
    const campaignData: { [key: string]: { revenue: number; expenses: number; recordCount: number } } = {};
    records.forEach(record => {
      const campaign = record.campaign_name || 'No Campaign';
      if (!campaignData[campaign]) {
        campaignData[campaign] = { revenue: 0, expenses: 0, recordCount: 0 };
      }
      
      campaignData[campaign].recordCount++;
      
      if (record.transaction_type === 'payment') {
        campaignData[campaign].revenue += record.amount;
      } else if (['ad_spend', 'fee'].includes(record.transaction_type)) {
        campaignData[campaign].expenses += record.amount;
      }
    });

    const campaignPerformance = Object.entries(campaignData).map(([campaign, data]) => ({
      campaign,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
      roi: data.expenses > 0 ? ((data.revenue - data.expenses) / data.expenses) * 100 : 0
    })).sort((a, b) => b.profit - a.profit);

    // Client performance
    const clientData: { [key: string]: { revenue: number; expenses: number; recordCount: number } } = {};
    records.forEach(record => {
      const client = record.client_name || 'No Client';
      if (!clientData[client]) {
        clientData[client] = { revenue: 0, expenses: 0, recordCount: 0 };
      }
      
      clientData[client].recordCount++;
      
      if (record.transaction_type === 'payment') {
        clientData[client].revenue += record.amount;
      } else if (['ad_spend', 'fee'].includes(record.transaction_type)) {
        clientData[client].expenses += record.amount;
      }
    });

    const clientPerformance = Object.entries(clientData).map(([client, data]) => ({
      client,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
      recordCount: data.recordCount
    })).sort((a, b) => b.profit - a.profit);

    // Expense breakdown
    const expenseData: { [key: string]: number } = {};
    records
      .filter(r => ['ad_spend', 'fee'].includes(r.transaction_type))
      .forEach(record => {
        expenseData[record.transaction_type] = (expenseData[record.transaction_type] || 0) + record.amount;
      });

    const totalExpensesForPercentage = Object.values(expenseData).reduce((sum, amount) => sum + amount, 0);
    const expenseBreakdown = Object.entries(expenseData).map(([type, amount]) => ({
      type: type.replace('_', ' '),
      amount,
      percentage: totalExpensesForPercentage > 0 ? (amount / totalExpensesForPercentage) * 100 : 0
    }));

    return {
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalRecords: records.length,
        profitMargin
      },
      monthlyBreakdown,
      campaignPerformance,
      clientPerformance,
      expenseBreakdown
    };
  };

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // This would integrate with a report generation service
    console.log(`Exporting ${reportType} report as ${format} for date range:`, dateRange);
    // Implementation would depend on your preferred export solution
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Generating report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={generateReport} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="detailed">Detailed Report</SelectItem>
                    <SelectItem value="campaign">Campaign Report</SelectItem>
                    <SelectItem value="client">Client Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateReport}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => exportReport('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.summary.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">From payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.summary.totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">Ad spend & fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  reportData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(reportData.summary.netProfit)}
                </div>
                <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  reportData.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reportData.summary.profitMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Profit / Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.summary.totalRecords}</div>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Revenue and expenses by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.monthlyBreakdown.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">{month.recordCount} records</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">Revenue</p>
                        <p className="font-bold">{formatCurrency(month.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-red-600">Expenses</p>
                        <p className="font-bold">{formatCurrency(month.expenses)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Profit</p>
                        <p className={`font-bold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Top performing campaigns by profit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.campaignPerformance.slice(0, 10).map((campaign, index) => (
                  <div key={campaign.campaign} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{campaign.campaign}</p>
                        <p className="text-sm text-muted-foreground">
                          ROI: {campaign.roi.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">Revenue</p>
                        <p className="font-bold">{formatCurrency(campaign.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-red-600">Expenses</p>
                        <p className="font-bold">{formatCurrency(campaign.expenses)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Profit</p>
                        <p className={`font-bold ${campaign.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(campaign.profit)}
                        </p>
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
              <CardTitle>Client Performance</CardTitle>
              <CardDescription>Top performing clients by profit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.clientPerformance.slice(0, 10).map((client, index) => (
                  <div key={client.client} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{client.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.recordCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">Revenue</p>
                        <p className="font-bold">{formatCurrency(client.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-red-600">Expenses</p>
                        <p className="font-bold">{formatCurrency(client.expenses)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Profit</p>
                        <p className={`font-bold ${client.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(client.profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Distribution of expenses by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.expenseBreakdown.map((expense) => (
                  <div key={expense.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="font-medium capitalize">{expense.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.percentage.toFixed(1)}% of total expenses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
