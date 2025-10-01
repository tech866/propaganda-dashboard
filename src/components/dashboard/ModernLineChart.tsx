'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Sample data - in a real app, this would come from props or API
const data = [
  { name: 'Feb', revenue: 4000, adSpend: 2400, profit: 1600 },
  { name: 'Mar', revenue: 3000, adSpend: 1398, profit: 1602 },
  { name: 'Apr', revenue: 2000, adSpend: 9800, profit: -7800 },
  { name: 'May', revenue: 2780, adSpend: 3908, profit: -1128 },
  { name: 'Jun', revenue: 1890, adSpend: 4800, profit: -2910 },
  { name: 'Jul', revenue: 2390, adSpend: 3800, profit: -1410 },
  { name: 'Aug', revenue: 3490, adSpend: 4300, profit: -810 },
  { name: 'Sep', revenue: 3000, adSpend: 1398, profit: 1602 },
  { name: 'Oct', revenue: 2000, adSpend: 9800, profit: -7800 },
  { name: 'Nov', revenue: 2780, adSpend: 3908, profit: -1128 },
  { name: 'Dec', revenue: 1890, adSpend: 4800, profit: -2910 },
];

interface ModernLineChartProps {
  className?: string;
  title?: string;
  description?: string;
  data?: any[];
  height?: number;
}

export default function ModernLineChart({ 
  className = '',
  title = "Revenue and Profit Trends",
  description = "Monthly performance over the past year",
  data: chartData = data,
  height = 300
}: ModernLineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card-modern p-4 border border-border/50">
          <p className="text-body-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-body-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="adSpend" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--destructive))", strokeWidth: 2 }}
                name="Ad Spend"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--success))", strokeWidth: 2 }}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


