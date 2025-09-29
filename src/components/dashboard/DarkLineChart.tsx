'use client';

import React from 'react';

interface DarkLineChartProps {
  className?: string;
}

export default function DarkLineChart({ className = '' }: DarkLineChartProps) {
  // Mock data for the chart
  const chartData = [
    { month: 'Feb', blue: 120, orange: 100, green: 80 },
    { month: 'Mar', blue: 140, orange: 120, green: 90 },
    { month: 'Apr', blue: 160, orange: 140, green: 100 },
    { month: 'May', blue: 180, orange: 160, green: 110 },
    { month: 'Jun', blue: 200, orange: 180, green: 120 },
    { month: 'Jul', blue: 220, orange: 200, green: 130 },
    { month: 'Aug', blue: 240, orange: 220, green: 140 },
    { month: 'Sep', blue: 260, orange: 240, green: 150 },
    { month: 'Oct', blue: 280, orange: 260, green: 160 },
    { month: 'Nov', blue: 300, orange: 280, green: 170 },
    { month: 'Dec', blue: 320, orange: 300, green: 180 }
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.blue, d.orange, d.green)));

  return (
    <div className={`chart-container ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          end, and profit trends over the past year.
        </h3>
      </div>

      <div className="relative h-80">
        {/* Chart Grid */}
        <div className="absolute inset-0">
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <div
              key={index}
              className="absolute w-full border-t border-gray-700"
              style={{ top: `${ratio * 100}%` }}
            />
          ))}
          
          {/* Vertical grid lines */}
          {chartData.map((_, index) => (
            <div
              key={index}
              className="absolute h-full border-l border-gray-700"
              style={{ left: `${(index / (chartData.length - 1)) * 100}%` }}
            />
          ))}
        </div>

        {/* Chart Lines */}
        <div className="absolute inset-0 p-4">
          {/* Blue line */}
          <svg className="w-full h-full">
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points={chartData.map((d, index) => 
                `${(index / (chartData.length - 1)) * 100}%,${100 - (d.blue / maxValue) * 100}%`
              ).join(' ')}
            />
            {chartData.map((d, index) => (
              <circle
                key={index}
                cx={`${(index / (chartData.length - 1)) * 100}%`}
                cy={`${100 - (d.blue / maxValue) * 100}%`}
                r="4"
                fill="#3b82f6"
              />
            ))}
          </svg>

          {/* Orange line */}
          <svg className="w-full h-full">
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              points={chartData.map((d, index) => 
                `${(index / (chartData.length - 1)) * 100}%,${100 - (d.orange / maxValue) * 100}%`
              ).join(' ')}
            />
            {chartData.map((d, index) => (
              <circle
                key={index}
                cx={`${(index / (chartData.length - 1)) * 100}%`}
                cy={`${100 - (d.orange / maxValue) * 100}%`}
                r="4"
                fill="#f97316"
              />
            ))}
          </svg>

          {/* Green line */}
          <svg className="w-full h-full">
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              points={chartData.map((d, index) => 
                `${(index / (chartData.length - 1)) * 100}%,${100 - (d.green / maxValue) * 100}%`
              ).join(' ')}
            />
            {chartData.map((d, index) => (
              <circle
                key={index}
                cx={`${(index / (chartData.length - 1)) * 100}%`}
                cy={`${100 - (d.green / maxValue) * 100}%`}
                r="4"
                fill="#10b981"
              />
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2">
          {chartData.map((d, index) => (
            <span key={index} className="text-xs text-gray-400">
              {d.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
