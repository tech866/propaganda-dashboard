'use client';

import React from 'react';
import { DollarSign, CreditCard, User, Target } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  description: string;
  icon: React.ElementType;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType, description, icon: Icon }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${getChangeColor()}`}>
          {change}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

interface DarkKPICardsProps {
  className?: string;
}

export default function DarkKPICards({ className = '' }: DarkKPICardsProps) {
  const kpiData = [
    {
      title: 'Ad Spend',
      value: '$847,293',
      change: '+8.2% vs last month',
      changeType: 'positive' as const,
      description: 'Total advertising expenditure',
      icon: DollarSign
    },
    {
      title: 'Cash Collected',
      value: '$2,234,891',
      change: '+15.3% vs last month',
      changeType: 'positive' as const,
      description: 'Actual payments received',
      icon: CreditCard
    },
    {
      title: 'Average Order Value',
      value: '$4,892',
      change: '-2.1% vs last month',
      changeType: 'negative' as const,
      description: 'Mean transaction value',
      icon: User
    },
    {
      title: 'ROAS (Return on Ad Spend)',
      value: '3.36x',
      change: '+0.24x vs last month',
      changeType: 'positive' as const,
      description: 'Return on ad spend',
      icon: Target
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {kpiData.map((kpi, index) => (
        <KPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          change={kpi.change}
          changeType={kpi.changeType}
          description={kpi.description}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
}
