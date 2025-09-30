'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Save, Loader2 } from 'lucide-react';
import { CampaignService, CampaignFormData, Campaign } from '@/lib/services/campaignService';

interface CampaignFormProps {
  agencyId: string;
  campaign?: Campaign;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  onCancel: () => void;
}

export function CampaignForm({ agencyId, campaign, onSubmit, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    client_id: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    budget: 0,
    target_audience: '',
    objectives: '',
    platform: '',
    campaign_type: ''
  });
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);

  const campaignService = new CampaignService(agencyId);

  useEffect(() => {
    loadClients();
    if (campaign) {
      setFormData({
        name: campaign.name,
        client_id: campaign.client_id,
        status: campaign.status,
        start_date: campaign.start_date,
        end_date: campaign.end_date || '',
        budget: campaign.budget,
        target_audience: campaign.target_audience || '',
        objectives: campaign.objectives || '',
        platform: campaign.platform,
        campaign_type: campaign.campaign_type
      });
    }
  }, [campaign]);

  const loadClients = async () => {
    try {
      const data = await campaignService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CampaignFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</CardTitle>
            <CardDescription>
              {campaign ? 'Update campaign details' : 'Set up a new advertising campaign'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter campaign name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_id">Client *</Label>
                  {loadingClients ? (
                    <div className="flex items-center justify-center h-10 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => handleInputChange('client_id', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => handleInputChange('platform', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign_type">Campaign Type *</Label>
                  <Select
                    value={formData.campaign_type}
                    onValueChange={(value) => handleInputChange('campaign_type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="display">Display</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="retargeting">Retargeting</SelectItem>
                      <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                      <SelectItem value="lead_generation">Lead Generation</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates and Budget */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Timeline & Budget</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campaign Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Textarea
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder="Describe your target audience..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Campaign Objectives</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange('objectives', e.target.value)}
                  placeholder="What are the main objectives of this campaign?"
                  rows={3}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {campaign ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {campaign ? 'Update Campaign' : 'Create Campaign'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
