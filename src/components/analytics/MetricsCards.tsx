'use client';

import React from 'react';
import { SalesMetrics } from '@/lib/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneCall, 
  X, 
  Calendar, 
  CheckCircle, 
  UserX, 
  DollarSign,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface MetricsCardsProps {
  metrics: SalesMetrics;
  className?: string;
}

export default function MetricsCards({ metrics, className = '' }: MetricsCardsProps) {
  const metricCards = [
    {
      title: 'Calls Scheduled',
      value: metrics.calls_scheduled,
      icon: Calendar,
      color: 'bg-blue-600',
      description: 'Total calls booked'
    },
    {
      title: 'Calls Taken',
      value: metrics.calls_taken,
      icon: PhoneCall,
      color: 'bg-green-600',
      description: 'Calls that were attended'
    },
    {
      title: 'Calls Cancelled',
      value: metrics.calls_cancelled,
      icon: X,
      color: 'bg-red-600',
      description: 'Cancelled appointments'
    },
    {
      title: 'Calls Rescheduled',
      value: metrics.calls_rescheduled,
      icon: Calendar,
      color: 'bg-yellow-600',
      description: 'Rescheduled appointments'
    },
    {
      title: 'Calls Showed',
      value: metrics.calls_showed,
      icon: Users,
      color: 'bg-emerald-600',
      description: 'Clients who showed up'
    },
    {
      title: 'Calls Closed Won',
      value: metrics.calls_closed_won,
      icon: CheckCircle,
      color: 'bg-green-600',
      description: 'Successful closes'
    },
    {
      title: 'Calls Disqualified',
      value: metrics.calls_disqualified,
      icon: UserX,
      color: 'bg-gray-600',
      description: 'Disqualified prospects'
    },
    {
      title: 'Cash Collected',
      value: `$${metrics.cash_collected.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-600',
      description: 'Total revenue generated'
    }
  ];

  const rateCards = [
    {
      title: 'Show Rate',
      value: `${metrics.show_rate}%`,
      icon: TrendingUp,
      color: 'bg-blue-600',
      description: 'Showed / Scheduled',
      formula: `${metrics.calls_showed} / ${metrics.calls_scheduled}`
    },
    {
      title: 'Close Rate',
      value: `${metrics.close_rate}%`,
      icon: Target,
      color: 'bg-green-600',
      description: 'Closed / Taken',
      formula: `${metrics.calls_closed_won} / ${metrics.calls_taken}`
    },
    {
      title: 'Gross Collected per Booked Call',
      value: `$${metrics.gross_collected_per_booked_call.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-600',
      description: 'Cash / Scheduled',
      formula: `$${metrics.cash_collected.toLocaleString()} / ${metrics.calls_scheduled}`
    },
    {
      title: 'Cash per Live Call',
      value: `$${metrics.cash_per_live_call.toLocaleString()}`,
      icon: Phone,
      color: 'bg-blue-600',
      description: 'Cash / Taken',
      formula: `$${metrics.cash_collected.toLocaleString()} / ${metrics.calls_taken}`
    },
    {
      title: 'Cash Based AOV',
      value: `$${metrics.cash_based_aov.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-600',
      description: 'Cash / Closed',
      formula: `$${metrics.cash_collected.toLocaleString()} / ${metrics.calls_closed_won}`
    }
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Core Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Core Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Rate Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Performance Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rateCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {card.description}
                  </p>
                  {card.formula && (
                    <Badge variant="outline" className="text-xs">
                      {card.formula}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Conversion Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled to Showed:</span>
                  <span className="text-foreground font-medium">{metrics.show_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Showed to Closed:</span>
                  <span className="text-foreground font-medium">{metrics.close_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall Conversion:</span>
                  <span className="text-foreground font-medium">
                    {metrics.calls_scheduled > 0 ? 
                      ((metrics.calls_closed_won / metrics.calls_scheduled) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Revenue Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue:</span>
                  <span className="text-foreground font-medium">${metrics.cash_collected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Scheduled Call:</span>
                  <span className="text-foreground font-medium">${metrics.gross_collected_per_booked_call.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Live Call:</span>
                  <span className="text-foreground font-medium">${metrics.cash_per_live_call.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Call Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No-Show Rate:</span>
                  <span className="text-foreground font-medium">
                    {metrics.calls_scheduled > 0 ? 
                      (((metrics.calls_scheduled - metrics.calls_showed) / metrics.calls_scheduled) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancellation Rate:</span>
                  <span className="text-foreground font-medium">
                    {metrics.calls_scheduled > 0 ? 
                      ((metrics.calls_cancelled / metrics.calls_scheduled) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reschedule Rate:</span>
                  <span className="text-foreground font-medium">
                    {metrics.calls_scheduled > 0 ? 
                      ((metrics.calls_rescheduled / metrics.calls_scheduled) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
