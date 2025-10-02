'use client';

import { useState, useEffect } from 'react';
import { useAgency } from '@/hooks/useAgency';
import { useRole } from '@/contexts/RoleContext';
import { DashboardService, type DashboardKPIs, type ClientSummary, type CampaignMetrics, type FinancialRecord } from '@/lib/services/dashboardService';

interface ProgressiveDashboardProps {
  onRefresh?: () => void;
}

interface LoadingState {
  kpis: boolean;
  clients: boolean;
  campaigns: boolean;
  financial: boolean;
  stats: boolean;
}

export default function ProgressiveDashboard({ onRefresh }: ProgressiveDashboardProps) {
  const { agency, isLoading: agencyLoading } = useAgency();
  const { user: roleUser } = useRole();
  
  // State for each dashboard section
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [clientSummaries, setClientSummaries] = useState<ClientSummary[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignMetrics[]>([]);
  const [recentFinancial, setRecentFinancial] = useState<FinancialRecord[]>([]);
  const [agencyStats, setAgencyStats] = useState({ totalClients: 0, totalCampaigns: 0, totalUsers: 0 });
  
  // Loading states for each section
  const [loading, setLoading] = useState<LoadingState>({
    kpis: true,
    clients: true,
    campaigns: true,
    financial: true,
    stats: true
  });
  
  const [error, setError] = useState<string | null>(null);
  const [dashboardService, setDashboardService] = useState<DashboardService | null>(null);

  // Development bypass - show simple dashboard immediately
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-white mb-2">🚀 Development Mode</h1>
            <p className="text-slate-300">Dashboard loading optimized for development.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">✨ Next Steps</h2>
            <p className="text-slate-300">Start building your UI components and features!</p>
          </div>
        </div>
      </div>
    );
  }

  // Initialize dashboard service when agency is available
  useEffect(() => {
    if (agency && !agencyLoading) {
      const service = new DashboardService(agency.id);
      setDashboardService(service);
      loadDashboardDataProgressive(service);
    }
  }, [agency, agencyLoading]);

  const loadDashboardDataProgressive = async (service: DashboardService) => {
    if (!agency) return;

    console.log('Loading dashboard data progressively for agency:', agency.id);
    setError(null);

    // Load KPIs first (most important)
    try {
      const kpisData = await service.getKPIs();
      setKpis(kpisData);
      setLoading(prev => ({ ...prev, kpis: false }));
    } catch (err) {
      console.error('Error loading KPIs:', err);
      setLoading(prev => ({ ...prev, kpis: false }));
    }

    // Load client summaries in parallel with campaigns
    Promise.all([
      service.getClientSummaries().then(data => {
        setClientSummaries(data);
        setLoading(prev => ({ ...prev, clients: false }));
      }).catch(err => {
        console.error('Error loading client summaries:', err);
        setLoading(prev => ({ ...prev, clients: false }));
      }),
      
      service.getRecentCampaigns(5).then(data => {
        setRecentCampaigns(data);
        setLoading(prev => ({ ...prev, campaigns: false }));
      }).catch(err => {
        console.error('Error loading recent campaigns:', err);
        setLoading(prev => ({ ...prev, campaigns: false }));
      })
    ]);

    // Load financial data and stats in parallel
    Promise.all([
      service.getRecentFinancialActivity(10).then(data => {
        setRecentFinancial(data);
        setLoading(prev => ({ ...prev, financial: false }));
      }).catch(err => {
        console.error('Error loading financial activity:', err);
        setLoading(prev => ({ ...prev, financial: false }));
      }),
      
      service.getAgencyStats().then(data => {
        setAgencyStats(data);
        setLoading(prev => ({ ...prev, stats: false }));
      }).catch(err => {
        console.error('Error loading agency stats:', err);
        setLoading(prev => ({ ...prev, stats: false }));
      })
    ]);
  };

  const handleRefresh = () => {
    if (dashboardService) {
      loadDashboardDataProgressive(dashboardService);
      onRefresh?.();
    }
  };

  const isAnyLoading = Object.values(loading).some(Boolean);
  const isFullyLoaded = !Object.values(loading).some(Boolean);

  if (agencyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={isAnyLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {isAnyLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* KPIs Section - Loads first */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Key Performance Indicators</h2>
        {loading.kpis ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-700 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : kpis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400">Total Ad Spend</div>
              <div className="text-2xl font-bold text-white">${kpis.totalAdSpend.toLocaleString()}</div>
              <div className="text-sm text-green-400">+{kpis.adSpendChange}%</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400">Total Revenue</div>
              <div className="text-2xl font-bold text-white">${kpis.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-green-400">+{kpis.revenueChange}%</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400">Average Order Value</div>
              <div className="text-2xl font-bold text-white">${kpis.averageOrderValue.toLocaleString()}</div>
              <div className="text-sm text-red-400">{kpis.aovChange}%</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400">ROAS</div>
              <div className="text-2xl font-bold text-white">{kpis.roas.toFixed(2)}x</div>
              <div className="text-sm text-green-400">+{kpis.roasChange}%</div>
            </div>
          </div>
        ) : (
          <div className="text-red-400">Failed to load KPIs</div>
        )}
      </div>

      {/* Client Summaries Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Client Performance</h2>
        {loading.clients ? (
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-700 h-16 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : clientSummaries.length > 0 ? (
          <div className="space-y-3">
            {clientSummaries.map((client) => (
              <div key={client.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{client.name}</div>
                  <div className="text-sm text-slate-400">
                    {client.campaignCount} campaigns • {client.margin.toFixed(1)}% margin
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white">${client.totalRevenue.toLocaleString()}</div>
                  <div className={`text-sm ${
                    client.status === 'excellent' ? 'text-green-400' :
                    client.status === 'good' ? 'text-blue-400' :
                    client.status === 'needs_attention' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {client.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400">No client data available</div>
        )}
      </div>

      {/* Recent Campaigns Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Campaigns</h2>
        {loading.campaigns ? (
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-700 h-16 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : recentCampaigns.length > 0 ? (
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">{campaign.name}</div>
                    <div className="text-sm text-slate-400">{campaign.clientName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">ROAS: {campaign.roas.toFixed(2)}x</div>
                    <div className="text-sm text-slate-400">${campaign.revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400">No campaign data available</div>
        )}
      </div>

      {/* Agency Stats Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Agency Overview</h2>
        {loading.stats ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-700 h-20 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{agencyStats.totalClients}</div>
              <div className="text-sm text-slate-400">Total Clients</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{agencyStats.totalCampaigns}</div>
              <div className="text-sm text-slate-400">Active Campaigns</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{agencyStats.totalUsers}</div>
              <div className="text-sm text-slate-400">Team Members</div>
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isAnyLoading && (
        <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-white">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Success indicator */}
      {isFullyLoaded && (
        <div className="fixed bottom-4 right-4 bg-green-800 border border-green-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            <span className="text-sm text-white">Dashboard loaded successfully</span>
          </div>
        </div>
      )}
    </div>
  );
}
