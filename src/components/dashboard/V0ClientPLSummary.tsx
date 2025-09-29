'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface V0ClientPLSummaryProps {
  className?: string;
}

export default function V0ClientPLSummary({ className = '' }: V0ClientPLSummaryProps) {
  // Exact data from v0.dev design
  const clientData = [
    {
      name: 'TechCorp Inc.',
      status: 'excellent',
      revenue: '$892k',
      adSpend: '$268k',
      margin: '70.0%',
      total: '$624,400',
      progress: 70,
    },
    {
      name: 'StartupXYZ',
      status: 'excellent',
      revenue: '$650k',
      adSpend: '$195k',
      margin: '70.0%',
      total: '$457,800',
      progress: 70,
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-gray-800 text-white text-sm px-3 py-1';
      case 'good':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

         return (
           <div className={cn("modern-card p-6", className)}>
             <div className="mb-6">
               <h2 className="text-xl font-semibold text-white mb-2 modern-text">$ Client P&L Summary</h2>
               <p className="text-sm text-gray-300 modern-text">Profit and loss breakdown by client.</p>
             </div>
             <div className="space-y-6">
               {clientData.map((client, index) => (
                 <div key={index} className="modern-card p-4 relative group hover:scale-[1.02] transition-all duration-300">
                   <div className="flex justify-between items-center mb-2">
                     <div className="flex items-center space-x-2">
                       <h3 className="text-lg font-semibold text-white modern-text">{client.name}</h3>
                       <Badge className={getStatusBadgeClass(client.status)}>{client.status}</Badge>
                     </div>
                     <span className="text-xl font-bold text-white modern-text">{client.total}</span>
                   </div>
                   <div className="grid grid-cols-3 gap-4 text-sm text-gray-300 mb-3">
                     <div>Revenue: <span className="font-medium text-white">{client.revenue}</span></div>
                     <div>Ad Spend: <span className="font-medium text-white">{client.adSpend}</span></div>
                     <div>Margin: <span className="font-medium text-white">{client.margin}</span></div>
                   </div>
                   <div className="progress-bar w-full h-2">
                     <div 
                       className="progress-fill" 
                       style={{ width: `${client.progress}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
      </div>
    </div>
  );
}
