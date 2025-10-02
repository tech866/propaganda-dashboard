'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Target, TrendingDown, TrendingUp, Users, MousePointer, FileText, CheckCircle, Award } from 'lucide-react';
import { ConversionFunnelData } from '@/lib/services/performanceService';

interface ConversionFunnelChartProps {
  data: ConversionFunnelData[];
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'impressions':
        return <Target className="h-4 w-4" />;
      case 'clicks':
        return <MousePointer className="h-4 w-4" />;
      case 'landing page views':
        return <FileText className="h-4 w-4" />;
      case 'form starts':
        return <FileText className="h-4 w-4" />;
      case 'form completions':
        return <CheckCircle className="h-4 w-4" />;
      case 'qualified leads':
        return <Users className="h-4 w-4" />;
      case 'conversions':
        return <Award className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStageColor = (index: number) => {
    const colors = [
      '#3b82f6', // blue-500
      '#8b5cf6', // purple-500
      '#06b6d4', // cyan-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#84cc16'  // lime-500
    ];
    return colors[index % colors.length];
  };

  const getDropOffColor = (dropOffRate: number) => {
    if (dropOffRate > 70) return 'text-red-600 bg-red-100 border-red-200';
    if (dropOffRate > 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: ConversionFunnelData }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl p-4">
          <p className="font-medium text-white mb-3 text-sm">{label}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Count:</span>
              <span className="font-medium text-white font-mono">{formatNumber(data.count)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Percentage:</span>
              <span className="font-medium text-white">{formatPercentage(data.percentage)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">Drop-off Rate:</span>
              <span className="font-medium text-white">{formatPercentage(data.dropOffRate)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalImpressions = data[0]?.count || 1;
  const totalConversions = data[data.length - 1]?.count || 0;
  const overallConversionRate = (totalConversions / totalImpressions) * 100;

  return (
    <div className="space-y-6">
      {/* Funnel Overview */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-500/50 px-3 py-1 text-sm font-medium">
              Funnel Analysis
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            <Target className="h-6 w-6 text-purple-400" />
            Conversion Funnel Analysis
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Track user journey from impressions to conversions with drop-off analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 hover:scale-105">
              <div className="text-2xl font-bold text-blue-400">
                {formatNumber(totalImpressions)}
              </div>
              <div className="text-sm text-gray-400">Total Impressions</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-200 hover:scale-105">
              <div className="text-2xl font-bold text-green-400">
                {formatNumber(totalConversions)}
              </div>
              <div className="text-sm text-gray-400">Total Conversions</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:scale-105">
              <div className="text-2xl font-bold text-purple-400">
                {formatPercentage(overallConversionRate)}
              </div>
              <div className="text-sm text-gray-400">Overall Conversion Rate</div>
            </div>
          </div>

          {/* Funnel Visualization */}
          <div className="space-y-4">
            {data.map((stage, index) => {
              const width = (stage.percentage / 100) * 100;
              const color = getStageColor(index);
              
              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50">
                        {getStageIcon(stage.stage)}
                      </div>
                      <span className="font-medium text-white">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 font-mono">
                        {formatNumber(stage.count)}
                      </span>
                      <Badge variant="outline" className="text-xs bg-slate-800/50 border-slate-600/50 text-gray-300">
                        {formatPercentage(stage.percentage)}
                      </Badge>
                      {index > 0 && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDropOffColor(stage.dropOffRate)}`}
                        >
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {formatPercentage(stage.dropOffRate)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-800/50 rounded-full h-10 overflow-hidden border border-slate-700/50">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                        style={{ 
                          width: `${width}%`,
                          backgroundColor: color,
                          boxShadow: `0 0 20px ${color}40`
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-lg">
                        {formatPercentage(stage.percentage)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart Visualization */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <Badge variant="outline" className="bg-cyan-600/20 text-cyan-300 border-cyan-500/50 px-3 py-1 text-sm font-medium">
              Stage Comparison
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            <BarChart className="h-6 w-6 text-cyan-400" />
            Funnel Stage Comparison
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Visual comparison of conversion rates across all funnel stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="stage" 
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStageColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <Badge variant="outline" className="bg-orange-600/20 text-orange-300 border-orange-500/50 px-3 py-1 text-sm font-medium">
              Performance Insights
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            <Target className="h-6 w-6 text-orange-400" />
            Funnel Performance Insights
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Key insights and recommendations based on funnel analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                High Drop-off Stages
              </h4>
              <div className="space-y-3">
                {data
                  .filter(stage => stage.dropOffRate > 50)
                  .map((stage, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/15 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/20">
                          {getStageIcon(stage.stage)}
                        </div>
                        <span className="text-sm font-medium text-white">{stage.stage}</span>
                      </div>
                      <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                        {formatPercentage(stage.dropOffRate)} drop-off
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Best Performing Stages
              </h4>
              <div className="space-y-3">
                {data
                  .filter(stage => stage.dropOffRate < 30)
                  .map((stage, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/15 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          {getStageIcon(stage.stage)}
                        </div>
                        <span className="text-sm font-medium text-white">{stage.stage}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                        {formatPercentage(stage.dropOffRate)} drop-off
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}