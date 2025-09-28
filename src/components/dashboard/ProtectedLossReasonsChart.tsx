'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useRole } from '@/contexts/RoleContext';
import { ProtectedComponent } from '@/components/auth/ProtectedComponent';

interface LossReason {
  reason: string;
  count: number;
}

interface ProtectedLossReasonsChartProps {
  className?: string;
  showAllData?: boolean; // If true, shows all data regardless of role
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-24 w-24"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-4">Loading loss reasons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loss Reasons Unavailable</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Loss Reason Data</h3>
          <p className="text-gray-600">No loss reason data available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Loss Reasons Breakdown</h3>
        <div className="text-sm text-gray-500">
          {hasAnyRole(['admin', 'ceo']) ? 'All Data' : 'Your Data'}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="reason"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
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
