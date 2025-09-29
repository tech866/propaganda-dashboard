'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Phone,
  CheckCircle,
  Target,
  DollarSign
} from 'lucide-react';

interface MetricsData {
  showRate?: {
    percentage: number;
    total: number;
    shows: number;
  };
  closeRate?: {
    percentage: number;
    total: number;
    closes: number;
  };
  totalCalls?: number;
  wonCalls?: number;
}

interface ModernMetricsCardProps {
  data?: MetricsData | null;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    userId?: string;
  };
  className?: string;
}

export default function ModernMetricsCard({ data, filters, className = '' }: ModernMetricsCardProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters from filters
        const params = new URLSearchParams();
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.clientId) params.append('clientId', filters.clientId);
        if (filters?.userId) params.append('userId', filters.userId);
        
        const queryString = params.toString();
        const url = queryString ? `/api/metrics?${queryString}` : '/api/metrics';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
        
        const responseData = await response.json();
        setMetrics(responseData.data);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    if (!data) {
      fetchMetrics();
    } else {
      setMetrics(data);
      setLoading(false);
    }
  }, [filters, data]);

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <div className="h-4 w-4 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium">Error loading metrics</span>
          </div>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }
  const metricsCards = [
    {
      title: 'Show Rate',
      value: metrics?.showRate?.percentage || 0,
      suffix: '%',
      icon: CheckCircle,
      bgColor: 'bg-emerald-500',
      iconColor: 'text-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      description: `${metrics?.showRate?.shows || 0} shows out of ${metrics?.showRate?.total || 0} calls`,
      trend: metrics?.showRate?.percentage > 0 ? 'positive' : 'neutral',
      trendValue: metrics?.showRate?.percentage || 0
    },
    {
      title: 'Close Rate',
      value: metrics?.closeRate?.percentage || 0,
      suffix: '%',
      icon: Target,
      bgColor: 'bg-blue-500',
      iconColor: 'text-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      description: `${metrics?.closeRate?.closes || 0} closes out of ${metrics?.closeRate?.total || 0} shows`,
      trend: metrics?.closeRate?.percentage > 0 ? 'positive' : 'neutral',
      trendValue: metrics?.closeRate?.percentage || 0
    },
    {
      title: 'Total Calls',
      value: metrics?.totalCalls || 0,
      suffix: '',
      icon: Phone,
      bgColor: 'bg-purple-500',
      iconColor: 'text-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      description: 'Total number of calls logged',
      trend: 'neutral',
      trendValue: 0
    },
    {
      title: 'Wins',
      value: metrics?.wonCalls || 0,
      suffix: '',
      icon: DollarSign,
      bgColor: 'bg-amber-500',
      iconColor: 'text-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      description: 'Number of successful closes',
      trend: 'positive',
      trendValue: metrics?.wonCalls || 0
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive':
        return 'text-emerald-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {metricsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg bg-gradient-to-br", card.bgGradient)}>
                <Icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </span>
                  {card.suffix && (
                    <span className="text-lg font-medium text-gray-500">
                      {card.suffix}
                    </span>
                  )}
                </div>
                
                {card.trend !== 'neutral' && card.trendValue > 0 && (
                  <div className={cn("flex items-center space-x-1 text-sm font-medium", getTrendColor(card.trend))}>
                    {getTrendIcon(card.trend)}
                    <span>
                      {card.trend === 'positive' ? '+' : '-'}{card.trendValue.toFixed(1)}%
                    </span>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </CardContent>
            
            {/* Subtle gradient overlay */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none", card.bgGradient)} />
          </Card>
        );
      })}
    </div>
  );
}
