'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';

interface AdSpendData {
  id?: string;
  client_id: string;
  campaign_name?: string;
  platform: 'meta' | 'google' | 'other';
  spend_amount: number;
  date_from: Date;
  date_to: Date;
  clicks?: number;
  impressions?: number;
  source: 'manual' | 'api';
  meta_campaign_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface AdSpendFormData {
  campaign_name: string;
  platform: 'meta' | 'google' | 'other' | '';
  spend_amount: string;
  date_from: string;
  date_to: string;
  clicks: string;
  impressions: string;
  meta_campaign_id: string;
}

export default function AdSpendManager() {
  const { user, isLoaded } = useAuth();
  const [adSpendData, setAdSpendData] = useState<AdSpendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<AdSpendFormData>({
    campaign_name: '',
    platform: '',
    spend_amount: '',
    date_from: '',
    date_to: '',
    clicks: '',
    impressions: '',
    meta_campaign_id: '',
  });

  useEffect(() => {
    if (isLoaded && user) {
      loadAdSpendData();
    }
  }, [isLoaded, user]);

  const loadAdSpendData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ad-spend');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to load ad spend data');
      }

      setAdSpendData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ad spend data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const submitData = {
        campaign_name: formData.campaign_name || null,
        platform: formData.platform,
        spend_amount: parseFloat(formData.spend_amount),
        date_from: new Date(formData.date_from),
        date_to: new Date(formData.date_to),
        clicks: formData.clicks ? parseInt(formData.clicks) : null,
        impressions: formData.impressions ? parseInt(formData.impressions) : null,
        source: 'manual' as const,
        meta_campaign_id: formData.meta_campaign_id || null,
      };

      const response = await fetch('/api/ad-spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to add ad spend data');
      }

      // Reset form and reload data
      setFormData({
        campaign_name: '',
        platform: '',
        spend_amount: '',
        date_from: '',
        date_to: '',
        clicks: '',
        impressions: '',
        meta_campaign_id: '',
      });
      setShowForm(false);
      loadAdSpendData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ad spend data');
    } finally {
      setFormLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'meta': return 'bg-blue-900/30 text-blue-400 border border-blue-700/50';
      case 'google': return 'bg-red-900/30 text-red-400 border border-red-700/50';
      case 'other': return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'manual': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
      case 'api': return 'bg-green-900/30 text-green-400 border border-green-700/50';
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading ad spend data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Ad Spend Management</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/50">
                {user?.publicMetadata?.role?.toString().toUpperCase() || 'USER'}
              </span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
            >
              Add Ad Spend
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700/50 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">Error</h3>
                <div className="mt-2 text-sm text-red-300">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Ad Spend List */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-xl rounded-2xl">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
              Ad Spend Records ({adSpendData.length})
            </h3>

            {adSpendData.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-foreground">No ad spend data</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first ad spend record.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                  >
                    Add Ad Spend
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden shadow-xl border border-slate-700 rounded-xl">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Spend Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                    {adSpendData.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">
                            {ad.campaign_name || 'Unnamed Campaign'}
                          </div>
                          {ad.meta_campaign_id && (
                            <div className="text-sm text-muted-foreground">ID: {ad.meta_campaign_id}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(ad.platform)}`}>
                            {ad.platform.charAt(0).toUpperCase() + ad.platform.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          ${ad.spend_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(ad.date_from).toLocaleDateString()} - {new Date(ad.date_to).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(ad.source)}`}>
                            {ad.source.charAt(0).toUpperCase() + ad.source.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {ad.created_at ? new Date(ad.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Ad Spend Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-slate-700 w-96 shadow-2xl rounded-2xl bg-slate-800/90 backdrop-blur-xl">
            <FormContainer
              title="Add Ad Spend Data"
              subtitle="Enter your advertising spend information"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Campaign Name"
                  name="campaign_name"
                  type="text"
                  value={formData.campaign_name}
                  onChange={handleInputChange}
                  placeholder="Enter campaign name"
                />

                <FormField
                  label="Platform *"
                  name="platform"
                  type="select"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select platform</option>
                  <option value="meta">Meta (Facebook/Instagram)</option>
                  <option value="google">Google Ads</option>
                  <option value="other">Other</option>
                </FormField>

                <FormField
                  label="Spend Amount *"
                  name="spend_amount"
                  type="number"
                  step="0.01"
                  value={formData.spend_amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Start Date *"
                    name="date_from"
                    type="date"
                    value={formData.date_from}
                    onChange={handleInputChange}
                    required
                  />

                  <FormField
                    label="End Date *"
                    name="date_to"
                    type="date"
                    value={formData.date_to}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Clicks"
                    name="clicks"
                    type="number"
                    value={formData.clicks}
                    onChange={handleInputChange}
                    placeholder="0"
                  />

                  <FormField
                    label="Impressions"
                    name="impressions"
                    type="number"
                    value={formData.impressions}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <FormField
                  label="Meta Campaign ID"
                  name="meta_campaign_id"
                  type="text"
                  value={formData.meta_campaign_id}
                  onChange={handleInputChange}
                  placeholder="Enter Meta campaign ID (if applicable)"
                />

                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700/50 p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="flex space-x-4">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </FormButton>
                  <FormButton
                    type="submit"
                    loading={formLoading}
                    disabled={formLoading}
                    className="flex-1"
                  >
                    Add Ad Spend
                  </FormButton>
                </div>
              </form>
            </FormContainer>
          </div>
        </div>
      )}
    </div>
  );
}

