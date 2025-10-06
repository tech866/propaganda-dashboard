'use client';

// =====================================================
// Audit Logs Component
// Task 20.5: Implement Workspace Management UI Components and Audit Logging
// =====================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Search, 
  Filter,
  RefreshCw,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { 
  AdminOnly,
  ManagerOrAdmin 
} from '@/components/rbac/RBACGuard';

interface AuditLogsProps {
  workspaceId: string;
}

interface AuditLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

const ACTION_TYPES = [
  { value: 'all', label: 'All Actions' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'member', label: 'Member' },
  { value: 'invitation', label: 'Invitation' },
  { value: 'call', label: 'Call' },
  { value: 'client', label: 'Client' },
  { value: 'analytics', label: 'Analytics' }
];

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'workspace:created': <CheckCircle className="w-4 h-4 text-green-400" />,
  'workspace:updated': <Info className="w-4 h-4 text-blue-400" />,
  'workspace:deleted': <XCircle className="w-4 h-4 text-red-400" />,
  'member:invited': <User className="w-4 h-4 text-blue-400" />,
  'member:joined': <CheckCircle className="w-4 h-4 text-green-400" />,
  'member:removed': <XCircle className="w-4 h-4 text-red-400" />,
  'member:role_changed': <Activity className="w-4 h-4 text-yellow-400" />,
  'invitation:sent': <User className="w-4 h-4 text-blue-400" />,
  'invitation:accepted': <CheckCircle className="w-4 h-4 text-green-400" />,
  'invitation:expired': <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  'call:created': <CheckCircle className="w-4 h-4 text-green-400" />,
  'call:updated': <Info className="w-4 h-4 text-blue-400" />,
  'call:deleted': <XCircle className="w-4 h-4 text-red-400" />,
  'client:created': <CheckCircle className="w-4 h-4 text-green-400" />,
  'client:updated': <Info className="w-4 h-4 text-blue-400" />,
  'client:deleted': <XCircle className="w-4 h-4 text-red-400" />,
  'analytics:viewed': <Activity className="w-4 h-4 text-purple-400" />
};

const ACTION_COLORS: Record<string, string> = {
  'workspace:created': 'bg-green-600 text-white',
  'workspace:updated': 'bg-blue-600 text-white',
  'workspace:deleted': 'bg-red-600 text-white',
  'member:invited': 'bg-blue-600 text-white',
  'member:joined': 'bg-green-600 text-white',
  'member:removed': 'bg-red-600 text-white',
  'member:role_changed': 'bg-yellow-600 text-white',
  'invitation:sent': 'bg-blue-600 text-white',
  'invitation:accepted': 'bg-green-600 text-white',
  'invitation:expired': 'bg-yellow-600 text-white',
  'call:created': 'bg-green-600 text-white',
  'call:updated': 'bg-blue-600 text-white',
  'call:deleted': 'bg-red-600 text-white',
  'client:created': 'bg-green-600 text-white',
  'client:updated': 'bg-blue-600 text-white',
  'client:deleted': 'bg-red-600 text-white',
  'analytics:viewed': 'bg-purple-600 text-white'
};

export function AuditLogs({ workspaceId }: AuditLogsProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [workspaceId, page]);

  const fetchLogs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: reset ? '1' : page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType })
      });

      const response = await fetch(`/api/workspaces/${workspaceId}/audit-logs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      
      if (reset) {
        setLogs(data.logs);
      } else {
        setLogs(prev => [...prev, ...data.logs]);
      }
      
      setHasMore(data.hasMore);

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    fetchLogs(true);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    fetchLogs(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getActionDescription = (log: AuditLog) => {
    const action = log.action;
    const resourceType = log.resource_type;
    const details = log.details;

    switch (action) {
      case 'workspace:created':
        return `Created workspace "${details.name || 'Unknown'}"`;
      case 'workspace:updated':
        return `Updated workspace settings`;
      case 'workspace:deleted':
        return `Deleted workspace`;
      case 'member:invited':
        return `Invited ${details.email || 'user'} as ${details.role || 'member'}`;
      case 'member:joined':
        return `Joined workspace`;
      case 'member:removed':
        return `Removed member ${details.user_name || 'Unknown'}`;
      case 'member:role_changed':
        return `Changed role from ${details.old_role || 'Unknown'} to ${details.new_role || 'Unknown'}`;
      case 'invitation:sent':
        return `Sent invitation to ${details.email || 'Unknown'}`;
      case 'invitation:accepted':
        return `Accepted invitation`;
      case 'invitation:expired':
        return `Invitation expired for ${details.email || 'Unknown'}`;
      case 'call:created':
        return `Created call for ${details.prospect_name || 'Unknown'}`;
      case 'call:updated':
        return `Updated call for ${details.prospect_name || 'Unknown'}`;
      case 'call:deleted':
        return `Deleted call for ${details.prospect_name || 'Unknown'}`;
      case 'client:created':
        return `Created client "${details.name || 'Unknown'}"`;
      case 'client:updated':
        return `Updated client "${details.name || 'Unknown'}"`;
      case 'client:deleted':
        return `Deleted client "${details.name || 'Unknown'}"`;
      case 'analytics:viewed':
        return `Viewed analytics`;
      default:
        return `${action} on ${resourceType}`;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-slate-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Audit Logs</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => fetchLogs(true)}
              variant="outline"
              className="border-slate-600 text-foreground"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ManagerOrAdmin workspaceId={workspaceId}>
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Audit Logs ({logs.length})
            </CardTitle>
            <Button
              onClick={() => fetchLogs(true)}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-slate-600 text-foreground"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-foreground"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-slate-600 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {ACTION_TYPES.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-foreground hover:bg-slate-700"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Logs List */}
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Audit Logs</h3>
              <p className="text-muted-foreground">No audit logs found for this workspace.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const { date, time } = formatDate(log.created_at);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex-shrink-0">
                      {ACTION_ICONS[log.action] || <Activity className="w-4 h-4 text-gray-400" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={ACTION_COLORS[log.action] || 'bg-gray-600 text-white'}>
                          {log.action.replace(':', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.resource_type}
                        </span>
                      </div>
                      
                      <p className="text-foreground font-medium mb-1">
                        {getActionDescription(log)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user_name || log.user_email || 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {date} at {time}
                        </div>
                        {log.ip_address && (
                          <span className="font-mono text-xs">
                            {log.ip_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load More */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    className="border-slate-600 text-foreground"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ManagerOrAdmin>
  );
}
