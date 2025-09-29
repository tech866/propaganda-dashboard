'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

// Exact data from v0.dev design
const data = [
  { name: 'Feb', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Mar', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Apr', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'May', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Jun', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jul', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Aug', uv: 3490, pv: 4300, amt: 2100 },
  { name: 'Sep', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Oct', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Nov', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Dec', uv: 1890, pv: 4800, amt: 2181 },
];

interface V0LineChartProps {
  className?: string;
}

export default function V0LineChart({ className = '' }: V0LineChartProps) {
         return (
           <div className={cn("modern-card p-6", className)}>
             <h2 className="text-xl font-semibold text-white mb-6 modern-text">end, and profit trends over the past year</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis 
              dataKey="name" 
              stroke="#808080" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#808080" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333333', 
                borderRadius: '8px',
                color: '#ffffff'
              }}
              labelStyle={{ color: '#ffffff' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Line 
              type="monotone" 
              dataKey="uv" 
              stroke="#8884d8" 
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#8884d8' }} 
            />
            <Line 
              type="monotone" 
              dataKey="pv" 
              stroke="#82ca9d" 
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#82ca9d' }} 
            />
            <Line 
              type="monotone" 
              dataKey="amt" 
              stroke="#ffc658" 
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#ffc658' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
