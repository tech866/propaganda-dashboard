'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Target,
  Calendar
} from 'lucide-react';
import { PerformanceBreakdown } from '@/lib/services/performanceService';

interface PerformanceBreakdownTableProps {
  data: PerformanceBreakdown[];
  dimension: 'client' | 'user' | 'campaign' | 'time';
  onDimensionChange: (dimension: 'client' | 'user' | 'campaign' | 'time') => void;
}

type SortField = 'name' | 'revenue' | 'adSpend' | 'profit' | 'roas' | 'conversions' | 'conversionRate';
type SortDirection = 'asc' | 'desc';

export function PerformanceBreakdownTable({ 
  data, 
  dimension, 
  onDimensionChange 
}: PerformanceBreakdownTableProps) {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendBadge = (trend: 'up' | 'down' | 'stable') => {
    const colors = {
      up: 'bg-green-100 text-green-800 border-green-200',
      down: 'bg-red-100 text-red-800 border-red-200',
      stable: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge variant="outline" className={`${colors[trend]} flex items-center gap-1`}>
        {getTrendIcon(trend)}
        {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stable'}
      </Badge>
    );
  };

  const getDimensionIcon = (dim: string) => {
    switch (dim) {
      case 'client':
        return <Building2 className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'campaign':
        return <Target className="h-4 w-4" />;
      case 'time':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue: number | string = a[sortField];
    let bValue: number | string = b[sortField];

    if (sortField === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getDimensionLabel = (dim: string) => {
    switch (dim) {
      case 'client':
        return 'Client';
      case 'user':
        return 'User';
      case 'campaign':
        return 'Campaign';
      case 'time':
        return 'Time Period';
      default:
        return 'Item';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dimension Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance Breakdown
          </CardTitle>
          <CardDescription>
            Analyze performance metrics by different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['client', 'user', 'campaign', 'time'] as const).map((dim) => (
              <Button
                key={dim}
                variant={dimension === dim ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDimensionChange(dim)}
                className="flex items-center gap-2"
              >
                {getDimensionIcon(dim)}
                {getDimensionLabel(dim)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {getDimensionLabel(dimension)} Performance Analysis
          </CardTitle>
          <CardDescription>
            Detailed performance metrics sorted by {sortField} ({sortDirection})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      {getDimensionLabel(dimension)}
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('revenue')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Revenue
                      {getSortIcon('revenue')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('adSpend')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Ad Spend
                      {getSortIcon('adSpend')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('profit')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Profit
                      {getSortIcon('profit')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('roas')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      ROAS
                      {getSortIcon('roas')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('conversions')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Conversions
                      {getSortIcon('conversions')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('conversionRate')}
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                    >
                      Conv. Rate
                      {getSortIcon('conversionRate')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getDimensionIcon(dimension)}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.revenue)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.adSpend)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(item.profit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={item.roas >= 2 ? 'text-green-600' : item.roas >= 1 ? 'text-yellow-600' : 'text-red-600'}>
                        {item.roas.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(item.conversions)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={item.conversionRate >= 3 ? 'text-green-600' : item.conversionRate >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {formatPercentage(item.conversionRate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTrendBadge(item.trend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>
            Aggregate performance metrics for all {getDimensionLabel(dimension).toLowerCase()}s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.adSpend, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Ad Spend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(data.reduce((sum, item) => sum + item.roas, 0) / data.length).toFixed(2)}x
              </div>
              <div className="text-sm text-muted-foreground">Average ROAS</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}