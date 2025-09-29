'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LossReason {
  reason: string;
  count: number;
  percentage: number;
}

interface LossReasonsChartProps {
  className?: string;
}

// Modern color palette using design system colors
const COLORS = [
  'hsl(var(--destructive))', // Destructive red
  'hsl(var(--warning))', // Warning orange
  'hsl(var(--primary))', // Primary blue
  'hsl(var(--success))', // Success green
  'hsl(var(--info))', // Info cyan
  'hsl(var(--secondary))', // Secondary purple
  'hsl(var(--muted))', // Muted gray
  'hsl(var(--accent))', // Accent color
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export default function LossReasonsChart({ className = '' }: LossReasonsChartProps) {
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLossReasons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/metrics');
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
        
        const data = await response.json();
        setLossReasons(data.data?.lossReasons || []);
      } catch (err) {
        console.error('Failed to fetch loss reasons:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch loss reasons');
      } finally {
        setLoading(false);
      }
    };

    fetchLossReasons();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="animate-pulse">
            <div className="h-6 bg-muted/20 rounded w-48 mb-4"></div>
            <div className="h-64 bg-muted/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-h4">Error loading loss reasons</h3>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lossReasons || lossReasons.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Loss Reasons</CardTitle>
        </CardHeader>
        <CardContent className="space-card">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-h4">No loss reasons data</h3>
            <p className="mt-1 text-muted-foreground">Start logging calls to see loss reasons analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = lossReasons.map((reason, index) => ({
    name: reason.reason,
    value: reason.count,
    percentage: reason.percentage,
    color: COLORS[index % COLORS.length]
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card-modern p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{data.value}</span> calls ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm text-muted-foreground">
              {entry.value} ({entry.payload.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Loss Reasons</CardTitle>
            <CardDescription>
              {lossReasons.length} reason{lossReasons.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-card">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary statistics */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">
                {lossReasons.reduce((sum, reason) => sum + reason.count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Losses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">
                {lossReasons.length > 0 ? lossReasons[0].reason : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Top Reason</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">
                {lossReasons.length > 0 ? `${lossReasons[0].percentage}%` : '0%'}
              </div>
              <div className="text-sm text-muted-foreground">Top Reason %</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
