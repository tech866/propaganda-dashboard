'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Plus, 
  Search, 
  RefreshCw, 
  Shield, 
  Edit, 
  Trash2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface LossReason {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LossReasonsManagement() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const { hasAnyRole, canManageLossReasons } = useRole();
  
  const [lossReasons, setLossReasons] = useState<LossReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user && !hasAnyRole(['admin', 'ceo'])) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router, hasAnyRole]);

  useEffect(() => {
    if (hasAnyRole(['admin', 'ceo'])) {
      fetchLossReasons();
    }
  }, [hasAnyRole]);

  const fetchLossReasons = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For now, we'll use mock data since we don't have a loss reasons API yet
      // TODO: Replace with actual API call when available
      const mockLossReasons: LossReason[] = [
        {
          id: '1',
          name: 'Not Interested',
          description: 'Prospect expressed no interest in the product or service',
          category: 'Interest Level',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Budget Constraints',
          description: 'Prospect cannot afford the product or service',
          category: 'Financial',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '3',
          name: 'Timing Not Right',
          description: 'Prospect is interested but timing is not suitable',
          category: 'Timing',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '4',
          name: 'Competitor Chosen',
          description: 'Prospect chose a competitor instead',
          category: 'Competition',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '5',
          name: 'No Decision Maker',
          description: 'Could not reach the decision maker',
          category: 'Process',
          isActive: false,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ];
      
      setLossReasons(mockLossReasons);
    } catch (err) {
      console.error('Failed to fetch loss reasons:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch loss reasons');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLossReason = async (lossReasonId: string) => {
    if (!confirm('Are you sure you want to delete this loss reason? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Replace with actual API call when available
      setLossReasons(prev => prev.filter(reason => reason.id !== lossReasonId));
    } catch (err) {
      console.error('Failed to delete loss reason:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete loss reason');
    }
  };

  const handleToggleLossReasonStatus = async (lossReasonId: string, currentStatus: boolean) => {
    try {
      // TODO: Replace with actual API call when available
      setLossReasons(prev => prev.map(reason => 
        reason.id === lossReasonId 
          ? { ...reason, isActive: !currentStatus }
          : reason
      ));
    } catch (err) {
      console.error('Failed to update loss reason status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update loss reason status');
    }
  };

  // Filter loss reasons based on search term, category, and status
  const filteredLossReasons = lossReasons.filter(reason => {
    const matchesSearch = reason.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reason.description && reason.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || reason.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && reason.isActive) ||
                         (statusFilter === 'inactive' && !reason.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(lossReasons.map(reason => reason.category)));

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAnyRole(['admin', 'ceo'])) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-h2">Access Denied</CardTitle>
            <CardDescription>You don&apos;t have permission to access loss reasons management.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ModernDashboardLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/admin')} 
                className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-110"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/25">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">
                  Loss Reasons Management
                </h1>
                <p className="text-lg text-gray-400 mt-2">Configure and manage loss reason categories for call tracking</p>
              </div>
            </div>
            <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 hover:scale-105">
              <Link href="/admin/loss-reasons/new">
                <Plus className="mr-2 h-4 w-4" /> Add New Reason
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-h4">Filters</CardTitle>
              <CardDescription>Search and filter loss reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Search Reasons
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Filter by Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="input-modern w-full"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-modern w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={fetchLossReasons}
                    variant="secondary"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-destructive/20 bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loss Reasons Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-h4">Loss Reasons</CardTitle>
              <CardDescription>Manage loss reason categories and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-destructive mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading loss reasons...</p>
                </div>
              ) : filteredLossReasons.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No loss reasons found matching your criteria.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLossReasons.map((reason) => (
                      <TableRow key={reason.id}>
                        <TableCell className="font-medium text-foreground">{reason.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {reason.description || 'No description'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{reason.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleToggleLossReasonStatus(reason.id, reason.isActive)}
                            variant={reason.isActive ? "success" : "destructive"}
                            size="sm"
                          >
                            {reason.isActive ? 'Active' : 'Inactive'}
                          </Button>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(reason.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/loss-reasons/${reason.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              onClick={() => handleDeleteLossReason(reason.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="mt-6 p-4 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLossReasons.length} of {lossReasons.length} loss reasons
            </p>
          </div>
        </div>
      </main>
    </ModernDashboardLayout>
  );
}
