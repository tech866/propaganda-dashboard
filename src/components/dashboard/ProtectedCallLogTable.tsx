'use client';

import React, { useEffect, useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { ProtectedComponent } from '@/components/auth/ProtectedComponent';
import { Call } from '@/lib/services/callService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface ProtectedCallLogTableProps {
  className?: string;
  showAllData?: boolean; // If true, shows all data regardless of role
}

function CallLogTableContent({ className = '', showAllData = false }: ProtectedCallLogTableProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, hasAnyRole } = useRole();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which calls endpoint to call based on user role
        let endpoint = '/api/calls';
        if (showAllData || hasAnyRole(['admin', 'ceo'])) {
          // Admin and CEO can see all calls
          endpoint = '/api/calls?includeAll=true';
        } else if (user?.role === 'sales') {
          // Sales users only see their own calls
          endpoint = `/api/calls?userId=${user.id}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch calls: ${response.status}`);
        }
        
        const data = await response.json();
        setCalls(data.data || []);
      } catch (err) {
        console.error('Failed to fetch calls:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch calls');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [user, hasAnyRole, showAllData]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="animate-pulse">
            <div className="h-6 bg-muted/20 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted/20 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="text-center">
            <h3 className="text-h4 mb-2">Call Logs Unavailable</h3>
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!calls || calls.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="space-card">
          <div className="text-center">
            <h3 className="text-h4 mb-2">No Call Logs</h3>
            <p className="text-muted-foreground">No call logs available at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Badge variant helpers
  const getCallTypeBadgeVariant = (callType: string) => {
    switch (callType) {
      case 'inbound': return 'info';
      case 'outbound': return 'default';
      default: return 'muted';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'no-show': return 'destructive';
      case 'rescheduled': return 'warning';
      default: return 'muted';
    }
  };

  const getOutcomeBadgeVariant = (outcome: string) => {
    switch (outcome) {
      case 'won': return 'success';
      case 'lost': return 'destructive';
      case 'tbd': return 'muted';
      default: return 'muted';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Call Logs</CardTitle>
            <CardDescription>
              {hasAnyRole(['admin', 'ceo']) ? 'All Calls' : 'Your Calls'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prospect Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Duration (min)</TableHead>
              <TableHead>Scheduled At</TableHead>
              <TableHead>Completed At</TableHead>
              {hasAnyRole(['admin', 'ceo']) && (
                <TableHead>User</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium">
                  {call.prospect_name}
                </TableCell>
                <TableCell>
                  <Badge variant={getCallTypeBadgeVariant(call.call_type) as any}>
                    {call.call_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(call.status) as any}>
                    {call.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getOutcomeBadgeVariant(call.outcome) as any}>
                    {call.outcome}
                  </Badge>
                </TableCell>
                <TableCell>
                  {call.call_duration ?? 'N/A'}
                </TableCell>
                <TableCell>
                  {call.scheduled_at ? new Date(call.scheduled_at).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {call.completed_at ? new Date(call.completed_at).toLocaleString() : 'N/A'}
                </TableCell>
                {hasAnyRole(['admin', 'ceo']) && (
                  <TableCell>
                    {call.user_id}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function ProtectedCallLogTable(props: ProtectedCallLogTableProps) {
  return (
    <ProtectedComponent
      requiredPermissions={['view_own_calls']}
      showAccessDenied={true}
    >
      <CallLogTableContent {...props} />
    </ProtectedComponent>
  );
}
