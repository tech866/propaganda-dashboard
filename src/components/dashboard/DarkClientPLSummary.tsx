'use client';

import React from 'react';

interface ClientPLCardProps {
  name: string;
  status: 'excellent' | 'good' | 'warning';
  revenue: string;
  adSpend: string;
  margin: string;
  total: string;
  progress: number;
}

const ClientPLCard: React.FC<ClientPLCardProps> = ({ 
  name, 
  status, 
  revenue, 
  adSpend, 
  margin, 
  total, 
  progress 
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'excellent':
        return <span className="badge-excellent">excellent</span>;
      case 'good':
        return <span className="badge-good">good</span>;
      case 'warning':
        return <span className="badge-warning">warning</span>;
      default:
        return <span className="badge-good">good</span>;
    }
  };

  return (
    <div className={`client-pl-card ${status === 'excellent' ? 'client-pl-excellent' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">{name}</h4>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Revenue:</span>
          <span className="text-sm text-white">{revenue}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Ad Spend:</span>
          <span className="text-sm text-white">{adSpend}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Margin:</span>
          <span className="text-sm text-white">{margin}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{total}</p>
        </div>
      </div>
    </div>
  );
};

interface DarkClientPLSummaryProps {
  className?: string;
}

export default function DarkClientPLSummary({ className = '' }: DarkClientPLSummaryProps) {
  const clientData = [
    {
      name: 'TechCorp Inc.',
      status: 'excellent' as const,
      revenue: '$892k',
      adSpend: '$268k',
      margin: '70.0%',
      total: '$624,400',
      progress: 85
    },
    {
      name: 'StartupXYZ',
      status: 'excellent' as const,
      revenue: '$650k',
      adSpend: '$195k',
      margin: '70.0%',
      total: '$457,800',
      progress: 75
    }
  ];

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          $ Client P&L Summary
        </h3>
        <p className="text-sm text-gray-400">
          Profit and loss breakdown by client.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clientData.map((client, index) => (
          <ClientPLCard
            key={index}
            name={client.name}
            status={client.status}
            revenue={client.revenue}
            adSpend={client.adSpend}
            margin={client.margin}
            total={client.total}
            progress={client.progress}
          />
        ))}
      </div>
    </div>
  );
}
