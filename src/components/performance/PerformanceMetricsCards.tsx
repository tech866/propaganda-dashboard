'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Users,
  MousePointer,
  Percent
} from 'lucide-react';
import { PerformanceMetrics } from '@/lib/services/performanceService';

interface PerformanceMetricsCardsProps {
  metrics: PerformanceMetrics;
}

export function PerformanceMetricsCards({ metrics }: PerformanceMetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendBadge = (value: number) => {
    const color = value > 0 ? 'bg-green-500/20 text-green-300 border-green-500/50' : 
                  value < 0 ? 'bg-red-500/20 text-red-300 border-red-500/50' : 
                  'bg-gray-500/20 text-gray-300 border-gray-500/50';
    
    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1 backdrop-blur-sm`}>
        {getTrendIcon(value)}
        {formatPercentage(Math.abs(value))}
      </Badge>
    );
  };

  const metricsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      description: 'Total revenue generated',
      icon: DollarSign,
      trend: metrics.monthlyGrowth,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      title: 'Total Ad Spend',
      value: formatCurrency(metrics.totalAdSpend),
      description: 'Total advertising expenditure',
      icon: Target,
      trend: -5.2, // Mock trend data
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Total Profit',
      value: formatCurrency(metrics.totalProfit),
      description: 'Net profit after expenses',
      icon: TrendingUp,
      trend: metrics.monthlyGrowth,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'ROAS',
      value: `${metrics.roas.toFixed(2)}x`,
      description: 'Return on ad spend',
      icon: Percent,
      trend: 8.3, // Mock trend data
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(metrics.conversionRate),
      description: 'Percentage of leads converted',
      icon: MousePointer,
      trend: 2.1, // Mock trend data
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200'
    },
    {
      title: 'Cost Per Lead',
      value: formatCurrency(metrics.costPerLead),
      description: 'Average cost to acquire a lead',
      icon: Users,
      trend: -3.7, // Mock trend data
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200'
    },
    {
      title: 'Lead Value',
      value: formatCurrency(metrics.leadValue),
      description: 'Average value per lead',
      icon: DollarSign,
      trend: 4.2, // Mock trend data
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Monthly Growth',
      value: formatPercentage(metrics.monthlyGrowth),
      description: 'Month-over-month growth',
      icon: TrendingUp,
      trend: metrics.monthlyGrowth,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index} 
            className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200">
                {metric.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-200">
                <Icon className={`h-4 w-4 ${metric.color} group-hover:scale-110 transition-transform duration-200`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`text-2xl font-bold ${metric.color} group-hover:scale-105 transition-transform duration-200`}>
                  {metric.value}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    {metric.description}
                  </p>
                  <div className="transform group-hover:scale-110 transition-transform duration-200">
                    {getTrendBadge(metric.trend)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}