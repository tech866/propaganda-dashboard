'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useRole } from '@/contexts/RoleContext';
import { ProtectedComponent } from '@/components/auth/ProtectedComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LossReason {
  reason: string;
  count: number;
}

interface ProtectedLossReasonsChartProps {
  className?: string;
  showAllData?: boolean; // If true, shows all data regardless of role
}

// Modern color palette using design system colors
const COLORS = [
  'hsl(var(--primary))', // Primary blue
  'hsl(var(--success))', // Success green
  'hsl(var(--warning))', // Warning orange
  'hsl(var(--destructive))', // Destructive red
  'hsl(var(--info))', // Info cyan
  'hsl(var(--secondary))', // Secondary purple
  'hsl(var(--accent))', // Accent color
  'hsl(var(--muted))', // Muted gray
];

function LossReasonsChartContent({ className = '', showAllData = false }: ProtectedLossReasonsChartProps) {
  const [data, setData] = useState<LossReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, hasAnyRole } = useRole();

  useEffect(() => {
    const fetchLossReasons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which endpoint to call based on user role
        let endpoint = '/api/metrics/loss-reasons';
        if (showAllData || hasAnyRole(['admin', 'ceo'])) {
          // Admin and CEO can see all loss reasons
          endpoint = '/api/metrics/loss-reasons?includeAll=true';
        } else if (user?.role === 'sales') {
          // Sales users only see their own loss reasons
          endpoint = `/api/metrics/loss-reasons?userId=${user.id}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch loss reasons: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        console.error('Failed to fetch loss reasons:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch loss reasons');
      } finally {
        setLoading(false);
      }
    };

    fetchLossReasons();
  }, [user, hasAnyRole, showAllData]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted/20 h-24 w-24"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted/20 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted/20 rounded"></div>
                <div className="h-4 bg-muted/20 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <p className="text-center text-muted-foreground mt-4">Loading loss reasons...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="text-center">
            <h3 className="text-h4 mb-2">Loss Reasons Unavailable</h3>
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="text-center">
            <h3 className="text-h4 mb-2">No Loss Reason Data</h3>
            <p className="text-muted-foreground">No loss reason data available at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Loss Reasons Breakdown</CardTitle>
            <CardDescription>
              {hasAnyRole(['admin', 'ceo']) ? 'All Data' : 'Your Data'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-card">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="count"
              nameKey="reason"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))', 
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                color: 'hsl(var(--foreground))',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function ProtectedLossReasonsChart(props: ProtectedLossReasonsChartProps) {
  return (
    <ProtectedComponent
      requiredPermissions={['view_own_metrics']}
      showAccessDenied={true}
    >
      <LossReasonsChartContent {...props} />
    </ProtectedComponent>
  );
}
