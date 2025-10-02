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
  Calendar,
  BarChart3
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
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <Badge variant="outline" className="bg-indigo-600/20 text-indigo-300 border-indigo-500/50 px-3 py-1 text-sm font-medium">
              Performance Breakdown
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-400" />
            Performance Breakdown
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Analyze performance metrics by different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(['client', 'user', 'campaign', 'time'] as const).map((dim) => (
              <Button
                key={dim}
                variant={dimension === dim ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDimensionChange(dim)}
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 ${
                  dimension === dim 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                    : 'bg-slate-800/50 border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:border-slate-500/70'
                }`}
              >
                {getDimensionIcon(dim)}
                {getDimensionLabel(dim)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <Badge variant="outline" className="bg-emerald-600/20 text-emerald-300 border-emerald-500/50 px-3 py-1 text-sm font-medium">
              Data Analysis
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-emerald-400" />
            {getDimensionLabel(dimension)} Performance Analysis
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Detailed performance metrics sorted by {sortField} ({sortDirection})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                  <TableHead className="w-[200px] text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {getDimensionLabel(dimension)}
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('revenue')}
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Revenue
                      {getSortIcon('revenue')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('adSpend')}
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Ad Spend
                      {getSortIcon('adSpend')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('profit')}
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Profit
                      {getSortIcon('profit')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('roas')}
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      ROAS
                      {getSortIcon('roas')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('conversions')}
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Conversions
                      {getSortIcon('conversions')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('conversionRate')}
                      className="h-auto p-0 font-semibold hover:bg-transparent text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Conv. Rate
                      {getSortIcon('conversionRate')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center text-gray-300">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow key={item.id} className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-800/50">
                          {getDimensionIcon(dimension)}
                        </div>
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-white">
                      {formatCurrency(item.revenue)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-white">
                      {formatCurrency(item.adSpend)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={item.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(item.profit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={item.roas >= 2 ? 'text-green-400' : item.roas >= 1 ? 'text-yellow-400' : 'text-red-400'}>
                        {item.roas.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-white">
                      {formatNumber(item.conversions)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={item.conversionRate >= 3 ? 'text-green-400' : item.conversionRate >= 2 ? 'text-yellow-400' : 'text-red-400'}>
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
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" aria-hidden="true"></div>
            <Badge variant="outline" className="bg-teal-600/20 text-teal-300 border-teal-500/50 px-3 py-1 text-sm font-medium">
              Summary Statistics
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-teal-400" />
            Summary Statistics
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Aggregate performance metrics for all {getDimensionLabel(dimension).toLowerCase()}s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-200 hover:scale-105">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 hover:scale-105">
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrency(data.reduce((sum, item) => sum + item.adSpend, 0))}
              </div>
              <div className="text-sm text-gray-400">Total Ad Spend</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:scale-105">
              <div className="text-2xl font-bold text-purple-400">
                {formatCurrency(data.reduce((sum, item) => sum + item.profit, 0))}
              </div>
              <div className="text-sm text-gray-400">Total Profit</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-200 hover:scale-105">
              <div className="text-2xl font-bold text-orange-400">
                {(data.reduce((sum, item) => sum + item.roas, 0) / data.length).toFixed(2)}x
              </div>
              <div className="text-sm text-gray-400">Average ROAS</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}