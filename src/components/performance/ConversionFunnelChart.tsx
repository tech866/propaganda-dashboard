'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Target, TrendingDown, Users, MousePointer, FileText, CheckCircle, Award } from 'lucide-react';
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Count:</span>
              <span className="font-medium text-foreground">{formatNumber(data.count)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-medium text-foreground">{formatPercentage(data.percentage)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Drop-off Rate:</span>
              <span className="font-medium text-foreground">{formatPercentage(data.dropOffRate)}</span>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Funnel Analysis
          </CardTitle>
          <CardDescription>
            Track user journey from impressions to conversions with drop-off analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(totalImpressions)}
              </div>
              <div className="text-sm text-muted-foreground">Total Impressions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(totalConversions)}
              </div>
              <div className="text-sm text-muted-foreground">Total Conversions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(overallConversionRate)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Conversion Rate</div>
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
                    <div className="flex items-center gap-2">
                      {getStageIcon(stage.stage)}
                      <span className="font-medium text-foreground">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(stage.count)}
                      </span>
                      <Badge variant="outline" className="text-xs">
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
                    <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${width}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white mix-blend-difference">
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
      <Card>
        <CardHeader>
          <CardTitle>Funnel Stage Comparison</CardTitle>
          <CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle>Funnel Performance Insights</CardTitle>
          <CardDescription>
            Key insights and recommendations based on funnel analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">High Drop-off Stages</h4>
              <div className="space-y-2">
                {data
                  .filter(stage => stage.dropOffRate > 50)
                  .map((stage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStageIcon(stage.stage)}
                        <span className="text-sm font-medium">{stage.stage}</span>
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        {formatPercentage(stage.dropOffRate)} drop-off
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Best Performing Stages</h4>
              <div className="space-y-2">
                {data
                  .filter(stage => stage.dropOffRate < 30)
                  .map((stage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStageIcon(stage.stage)}
                        <span className="text-sm font-medium">{stage.stage}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
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