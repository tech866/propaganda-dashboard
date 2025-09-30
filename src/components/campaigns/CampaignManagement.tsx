'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CampaignService, 
  Campaign, 
  formatCurrency, 
  formatNumber, 
  formatPercentage,
  getStatusColor,
  getStatusIcon
} from '@/lib/services/campaignService';
import { CampaignForm } from './CampaignForm';
import { CampaignDetails } from './CampaignDetails';
import { RoleBasedAccess, AgencyUsersAndAbove } from '@/components/auth/RoleBasedAccess';

interface CampaignManagementProps {
  agencyId: string;
}

export function CampaignManagement({ agencyId }: CampaignManagementProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);

  const campaignService = new CampaignService(agencyId);

  useEffect(() => {
    loadCampaigns();
  }, [agencyId]);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      await campaignService.createCampaign(campaignData);
      await loadCampaigns();
      setShowForm(false);
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err;
    }
  };

  const handleUpdateCampaign = async (campaignId: string, campaignData: any) => {
    try {
      await campaignService.updateCampaign(campaignId, campaignData);
      await loadCampaigns();
      setEditingCampaign(null);
    } catch (err) {
      console.error('Error updating campaign:', err);
      throw err;
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignService.deleteCampaign(campaignId);
        await loadCampaigns();
      } catch (err) {
        console.error('Error deleting campaign:', err);
        alert('Failed to delete campaign');
      }
    }
  };

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      await campaignService.updateCampaign(campaignId, { status: newStatus as any });
      await loadCampaigns();
    } catch (err) {
      console.error('Error updating campaign status:', err);
      alert('Failed to update campaign status');
    }
  };

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadCampaigns} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage and monitor your advertising campaigns
          </p>
        </div>
        <AgencyUsersAndAbove>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </AgencyUsersAndAbove>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Allocated budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? formatPercentage((totalSpent / totalBudget) * 100) : '0%'} of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Play className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns or clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>
            {filteredCampaigns.length} of {totalCampaigns} campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {campaign.campaign_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.client_name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(campaign.status)}`}
                    >
                      {getStatusIcon(campaign.status)} {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.platform}</TableCell>
                  <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                  <TableCell>{formatCurrency(campaign.spent_amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${campaign.budget > 0 ? (campaign.spent_amount / campaign.budget) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {campaign.budget > 0 ? formatPercentage((campaign.spent_amount / campaign.budget) * 100) : '0%'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setViewingCampaign(campaign)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <AgencyUsersAndAbove>
                          <DropdownMenuItem onClick={() => setEditingCampaign(campaign)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {campaign.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'paused')}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                          )}
                          {campaign.status === 'paused' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'active')}>
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AgencyUsersAndAbove>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {showForm && (
        <CampaignForm
          agencyId={agencyId}
          onSubmit={handleCreateCampaign}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingCampaign && (
        <CampaignForm
          agencyId={agencyId}
          campaign={editingCampaign}
          onSubmit={(data) => handleUpdateCampaign(editingCampaign.id, data)}
          onCancel={() => setEditingCampaign(null)}
        />
      )}

      {viewingCampaign && (
        <CampaignDetails
          campaign={viewingCampaign}
          agencyId={agencyId}
          onClose={() => setViewingCampaign(null)}
        />
      )}
    </div>
  );
}
