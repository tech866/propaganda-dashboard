'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';
import { TrendData } from '@/lib/services/performanceService';

interface PerformanceTrendChartProps {
  data: TrendData[];
  selectedMetric: 'revenue' | 'adSpend' | 'profit' | 'conversions';
  onMetricChange: (metric: 'revenue' | 'adSpend' | 'profit' | 'conversions') => void;
}

export function PerformanceTrendChart({ 
  data, 
  selectedMetric, 
  onMetricChange 
}: PerformanceTrendChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'revenue':
        return '#10b981'; // green-500
      case 'adSpend':
        return '#3b82f6'; // blue-500
      case 'profit':
        return '#8b5cf6'; // purple-500
      case 'conversions':
        return '#f59e0b'; // amber-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'revenue':
        return 'Revenue';
      case 'adSpend':
        return 'Ad Spend';
      case 'profit':
        return 'Profit';
      case 'conversions':
        return 'Conversions';
      default:
        return metric;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4">
          <p className="font-medium text-foreground mb-2">
            {formatDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.dataKey}:</span>
              <span className="font-medium text-foreground">
                {entry.dataKey === 'conversions' || entry.dataKey === 'leads' 
                  ? formatNumber(entry.value)
                  : formatCurrency(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={selectedMetric === 'conversions' || selectedMetric === 'leads' ? formatNumber : formatCurrency}
              stroke="#9ca3af"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              fill={getMetricColor(selectedMetric)}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            {selectedMetric !== 'conversions' && (
              <Area
                type="monotone"
                dataKey="conversions"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={selectedMetric === 'conversions' || selectedMetric === 'leads' ? formatNumber : formatCurrency}
              stroke="#9ca3af"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey={selectedMetric}
              fill={getMetricColor(selectedMetric)}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={selectedMetric === 'conversions' || selectedMetric === 'leads' ? formatNumber : formatCurrency}
              stroke="#9ca3af"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              strokeWidth={3}
              dot={{ fill: getMetricColor(selectedMetric), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: getMetricColor(selectedMetric), strokeWidth: 2 }}
            />
            {selectedMetric !== 'conversions' && (
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#f59e0b", strokeWidth: 2 }}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Track performance metrics over time with interactive charts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Line
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Area
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Metric Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Primary Metric:</span>
              <div className="flex gap-1">
                {(['revenue', 'adSpend', 'profit', 'conversions'] as const).map((metric) => (
                  <Button
                    key={metric}
                    variant={selectedMetric === metric ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onMetricChange(metric)}
                    className="text-xs"
                  >
                    {getMetricLabel(metric)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              {data.length > 0 && (
                <>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(Math.max(...data.map(d => d[selectedMetric])))
                        : formatCurrency(Math.max(...data.map(d => d[selectedMetric])))
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Peak {getMetricLabel(selectedMetric)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(Math.min(...data.map(d => d[selectedMetric])))
                        : formatCurrency(Math.min(...data.map(d => d[selectedMetric])))
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Lowest {getMetricLabel(selectedMetric)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(data.reduce((sum, d) => sum + d[selectedMetric], 0) / data.length)
                        : formatCurrency(data.reduce((sum, d) => sum + d[selectedMetric], 0) / data.length)
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Average {getMetricLabel(selectedMetric)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(data.reduce((sum, d) => sum + d[selectedMetric], 0))
                        : formatCurrency(data.reduce((sum, d) => sum + d[selectedMetric], 0))
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Total {getMetricLabel(selectedMetric)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}