'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, Users, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface V0KPICardsProps {
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    userId?: string;
  };
  className?: string;
}

export default function V0KPICards({ filters, className = '' }: V0KPICardsProps) {
  // Exact data from v0.dev design
  const kpiData = [
    {
      title: 'Ad Spend',
      value: '$847,293',
      change: '+8.2% vs last month',
      trend: 'positive',
      icon: DollarSign,
      description: 'Total advertising expenditure.',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Cash Collected',
      value: '$2,234,891',
      change: '+15.3% vs last month',
      trend: 'positive',
      icon: CreditCard,
      description: 'Actual payments received.',
      iconBg: 'bg-green-500'
    },
    {
      title: 'Average Order Value',
      value: '$4,892',
      change: '-2.1% vs last month',
      trend: 'negative',
      icon: Users,
      description: 'Mean transaction value.',
      iconBg: 'bg-yellow-500'
    },
    {
      title: 'ROAS (Return on Ad Spend)',
      value: '3.36x',
      change: '+0.24x vs last month',
      trend: 'positive',
      icon: Target,
      description: 'Return on ad spend.',
      iconBg: 'bg-red-500'
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

         return (
           <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
             {kpiData.map((kpi, index) => (
               <div key={index} className="kpi-card modern-card p-6 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-medium text-gray-300 modern-text">{kpi.title}</h3>
                   <div className={cn("h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110", kpi.iconBg)}>
                     <kpi.icon className="h-5 w-5 text-white" />
                   </div>
                 </div>
                 <div className="text-3xl font-bold text-white mb-2 modern-text">{kpi.value}</div>
                 <p className={cn("text-xs flex items-center mb-2 transition-colors duration-300", getTrendColor(kpi.trend))}>
                   {getTrendIcon(kpi.trend)}
                   <span className="ml-1">{kpi.change}</span>
                 </p>
                 <p className="text-xs text-gray-400 modern-text">{kpi.description}</p>
        </div>
      ))}
    </div>
  );
}
