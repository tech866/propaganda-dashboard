'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl p-4">
          <p className="font-medium text-white mb-3 text-sm">
            {formatDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 text-sm mb-1">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-400">{entry.dataKey}:</span>
              <span className="font-medium text-white">
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
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
                <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-500/50 px-3 py-1 text-sm font-medium">
                  Interactive Charts
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                Performance Trends
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Track performance metrics over time with interactive charts
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600/50 text-white hover:border-slate-500/70 focus:ring-blue-500/50 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="line" className="text-white hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="area" className="text-white hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Area Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar" className="text-white hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar Chart
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
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-300">Primary Metric:</span>
              <div className="flex gap-2">
                {(['revenue', 'adSpend', 'profit', 'conversions'] as const).map((metric) => (
                  <Button
                    key={metric}
                    variant={selectedMetric === metric ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onMetricChange(metric)}
                    className={`text-xs transition-all duration-200 hover:scale-105 ${
                      selectedMetric === metric 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-slate-800/50 border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:border-slate-500/70'
                    }`}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-700/50">
              {data.length > 0 && (
                <>
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-200 hover:scale-105">
                    <div className="text-lg font-semibold text-green-400">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(Math.max(...data.map(d => d[selectedMetric])))
                        : formatCurrency(Math.max(...data.map(d => d[selectedMetric])))
                      }
                    </div>
                    <div className="text-xs text-gray-400">Peak {getMetricLabel(selectedMetric)}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-200 hover:scale-105">
                    <div className="text-lg font-semibold text-red-400">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(Math.min(...data.map(d => d[selectedMetric])))
                        : formatCurrency(Math.min(...data.map(d => d[selectedMetric])))
                      }
                    </div>
                    <div className="text-xs text-gray-400">Lowest {getMetricLabel(selectedMetric)}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 hover:scale-105">
                    <div className="text-lg font-semibold text-blue-400">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(data.reduce((sum, d) => sum + d[selectedMetric], 0) / data.length)
                        : formatCurrency(data.reduce((sum, d) => sum + d[selectedMetric], 0) / data.length)
                      }
                    </div>
                    <div className="text-xs text-gray-400">Average {getMetricLabel(selectedMetric)}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:scale-105">
                    <div className="text-lg font-semibold text-purple-400">
                      {selectedMetric === 'conversions' || selectedMetric === 'leads' 
                        ? formatNumber(data.reduce((sum, d) => sum + d[selectedMetric], 0))
                        : formatCurrency(data.reduce((sum, d) => sum + d[selectedMetric], 0))
                      }
                    </div>
                    <div className="text-xs text-gray-400">Total {getMetricLabel(selectedMetric)}</div>
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