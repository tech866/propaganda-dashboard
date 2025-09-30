'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  DollarSign, 
  Target, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2,
  ExternalLink,
  BarChart3,
  Activity
} from 'lucide-react';
import { Campaign, formatCurrency, formatDate, getStatusColor } from '@/lib/services/campaignService';

interface CampaignDetailsProps {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
  onViewMetrics: () => void;
}

export function CampaignDetails({ campaign, onEdit, onDelete, onViewMetrics }: CampaignDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'google':
        return '🔍';
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'linkedin':
        return '💼';
      case 'twitter':
        return '🐦';
      case 'tiktok':
        return '🎵';
      case 'youtube':
        return '📺';
      default:
        return '📱';
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'search':
        return 'bg-blue-100 text-blue-800';
      case 'display':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'email':
        return 'bg-orange-100 text-orange-800';
      case 'retargeting':
        return 'bg-red-100 text-red-800';
      case 'brand_awareness':
        return 'bg-indigo-100 text-indigo-800';
      case 'lead_generation':
        return 'bg-yellow-100 text-yellow-800';
      case 'sales':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{campaign.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(campaign.status)}>
              {campaign.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {getPlatformIcon(campaign.platform)} {campaign.platform}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onViewMetrics}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Metrics
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Campaign Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client</Label>
                  <p className="text-sm font-medium">{campaign.client_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campaign Type</Label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCampaignTypeColor(campaign.campaign_type)}`}>
                      {campaign.campaign_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Platform</Label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {getPlatformIcon(campaign.platform)} {campaign.platform}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(campaign.status)}>
                      {campaign.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline & Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(campaign.budget)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {formatDate(campaign.start_date)}
                  </div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {campaign.end_date ? formatDate(campaign.end_date) : 'Ongoing'}
                  </div>
                  <div className="text-sm text-muted-foreground">End Date</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objectives & Target Audience */}
          {(campaign.objectives || campaign.target_audience) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.objectives && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Objectives</Label>
                    <p className="text-sm mt-1">{campaign.objectives}</p>
                  </div>
                )}
                {campaign.target_audience && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Target Audience</Label>
                    <p className="text-sm mt-1">{campaign.target_audience}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{formatDate(campaign.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">{formatDate(campaign.updated_at)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Campaign ID</span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {campaign.id.slice(0, 8)}...
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={onViewMetrics}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Performance
              </Button>
              <Button variant="outline" className="w-full" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View in Platform
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Campaign</CardTitle>
              <CardDescription>
                Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Delete Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper component for labels
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}>{children}</label>;
}
