'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MousePointer, 
  Eye,
  BarChart3,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { CampaignService, CampaignMetrics as CampaignMetricsType, formatCurrency, formatPercentage } from '@/lib/services/campaignService';

interface CampaignMetricsProps {
  campaignId: string;
  agencyId: string;
  onClose: () => void;
}

export function CampaignMetrics({ campaignId, agencyId, onClose }: CampaignMetricsProps) {
  const [metrics, setMetrics] = useState<CampaignMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const campaignService = new CampaignService(agencyId);

  useEffect(() => {
    loadMetrics();
  }, [campaignId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getCampaignMetrics(campaignId);
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading campaign metrics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error || 'Failed to load campaign metrics'}
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={loadMetrics}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Campaign Metrics
            </CardTitle>
            <CardDescription>
              Performance analytics for {metrics.campaign_name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadMetrics}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(metrics.total_spend)}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.spend_trend !== 0 && (
                        <span className={`inline-flex items-center gap-1 ${getTrendColor(metrics.spend_trend)}`}>
                          {getTrendIcon(metrics.spend_trend)}
                          {Math.abs(metrics.spend_trend).toFixed(1)}% vs last period
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.impressions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.impressions_trend !== 0 && (
                        <span className={`inline-flex items-center gap-1 ${getTrendColor(metrics.impressions_trend)}`}>
                          {getTrendIcon(metrics.impressions_trend)}
                          {Math.abs(metrics.impressions_trend).toFixed(1)}% vs last period
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.clicks.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.clicks_trend !== 0 && (
                        <span className={`inline-flex items-center gap-1 ${getTrendColor(metrics.clicks_trend)}`}>
                          {getTrendIcon(metrics.clicks_trend)}
                          {Math.abs(metrics.clicks_trend).toFixed(1)}% vs last period
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.conversions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {metrics.conversions_trend !== 0 && (
                        <span className={`inline-flex items-center gap-1 ${getTrendColor(metrics.conversions_trend)}`}>
                          {getTrendIcon(metrics.conversions_trend)}
                          {Math.abs(metrics.conversions_trend).toFixed(1)}% vs last period
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CTR (Click-Through Rate)</span>
                      <span className="text-sm font-bold">{formatPercentage(metrics.ctr)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm font-bold">{formatPercentage(metrics.conversion_rate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CPC (Cost Per Click)</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.cpc)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CPA (Cost Per Acquisition)</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.cpa)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ROI Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ROAS (Return on Ad Spend)</span>
                      <span className="text-sm font-bold">{metrics.roas.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Revenue</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Profit Margin</span>
                      <span className="text-sm font-bold">{formatPercentage(metrics.profit_margin)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Budget Utilization</span>
                      <span className="text-sm font-bold">{formatPercentage(metrics.budget_utilization)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Performance</CardTitle>
                  <CardDescription>Performance metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Spend</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead>Conversions</TableHead>
                        <TableHead>CPA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.daily_performance.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{day.date}</TableCell>
                          <TableCell>{formatCurrency(day.spend)}</TableCell>
                          <TableCell>{day.impressions.toLocaleString()}</TableCell>
                          <TableCell>{day.clicks.toLocaleString()}</TableCell>
                          <TableCell>{formatPercentage(day.ctr)}</TableCell>
                          <TableCell>{day.conversions.toLocaleString()}</TableCell>
                          <TableCell>{formatCurrency(day.cpa)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Demographics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Age Groups</h4>
                      {metrics.demographics.age_groups.map((group, index) => (
                        <div key={index} className="flex justify-between items-center mb-1">
                          <span className="text-sm">{group.range}</span>
                          <span className="text-sm font-medium">{formatPercentage(group.percentage)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Gender Distribution</h4>
                      {metrics.demographics.gender_distribution.map((gender, index) => (
                        <div key={index} className="flex justify-between items-center mb-1">
                          <span className="text-sm capitalize">{gender.gender}</span>
                          <span className="text-sm font-medium">{formatPercentage(gender.percentage)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Location</TableHead>
                          <TableHead>Impressions</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>CTR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.geographic_performance.map((location, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{location.location}</TableCell>
                            <TableCell>{location.impressions.toLocaleString()}</TableCell>
                            <TableCell>{location.clicks.toLocaleString()}</TableCell>
                            <TableCell>{formatPercentage(location.ctr)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Budget</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.budget)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Spend</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.total_spend)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Remaining Budget</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.budget - metrics.total_spend)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Revenue Generated</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(metrics.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Net Profit</span>
                      <span className={`text-sm font-bold ${metrics.revenue - metrics.total_spend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(metrics.revenue - metrics.total_spend)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cost Per Click (CPC)</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.cpc)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cost Per Mille (CPM)</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.cpm)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cost Per Acquisition (CPA)</span>
                      <span className="text-sm font-bold">{formatCurrency(metrics.cpa)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Return on Ad Spend (ROAS)</span>
                      <span className="text-sm font-bold">{metrics.roas.toFixed(2)}x</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
