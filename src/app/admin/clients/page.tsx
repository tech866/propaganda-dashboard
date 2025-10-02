'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useAgency } from '@/contexts/AgencyContext';
import DashboardNavigation from '@/components/navigation/DashboardNavigation';
import { 
  ClientService, 
  Client, 
  ClientFormData,
  getIndustryIcon,
  formatDate
} from '@/lib/services/clientService';
import ClientPerformanceDashboard from '@/components/clients/ClientPerformanceDashboard';
import { AuditService } from '@/lib/services/auditService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  Building2,
  Shield
} from 'lucide-react';

interface ClientStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  avgShowRate: number;
  avgCloseRate: number;
}

export default function ClientManagementPage() {
  const router = useRouter();
  const { user, hasAnyRole, isLoading: roleLoading } = useRole();
  const { agency, isLoading: agencyLoading } = useAgency();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'performance'>('list');
  
  // Initialize client service
  const clientService = useMemo(() => {
    return agency?.id ? new ClientService(agency.id) : null;
  }, [agency?.id]);

  const fetchClients = useCallback(async () => {
    if (!clientService) {
      console.error('Client service not available');
      setError('Client service not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch clients from the database
      const clientsData = await clientService.getClients();
      setClients(clientsData);

      // Calculate stats from real data
      const activeClients = clientsData.filter(c => c.status === 'active');
      const totalRevenue = clientsData.reduce((sum, client) => {
        // For now, we'll use a placeholder for revenue calculation
        // This would need to be calculated from actual sales data
        return sum + (client.monthly_budget || 0) * 12; // Annual revenue estimate
      }, 0);

      const stats: ClientStats = {
        totalClients: clientsData.length,
        activeClients: activeClients.length,
        totalRevenue: totalRevenue,
        avgShowRate: 75.0, // Placeholder - would be calculated from actual call data
        avgCloseRate: 45.0  // Placeholder - would be calculated from actual call data
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clientService]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else if (user && !hasAnyRole(['admin', 'ceo'])) {
      router.push('/dashboard');
    }
  }, [user, router, hasAnyRole]);

  useEffect(() => {
    if (user && hasAnyRole(['admin', 'ceo']) && agency?.id && clientService) {
      fetchClients();
    }
  }, [user, hasAnyRole, agency?.id, clientService, fetchClients]);

  // Show loading state while checking authentication, roles, and agency
  if (roleLoading || agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="text-white text-lg font-medium">Loading...</div>
          <div className="text-gray-400 text-sm mt-2">Initializing client management system</div>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have required role
  if (user && !hasAnyRole(['admin', 'ceo'])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">Access Denied</CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              You don&apos;t have permission to access client management. This feature is restricted to admin and CEO users only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/50">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50">{status}</Badge>;
    }
  };

  // CRUD Operations
  const handleCreateClient = async (clientData: ClientFormData) => {
    if (!clientService || !user) return;
    try {
      const newClient = await clientService.createClient(clientData);
      
      if (newClient) {
        // Log the action
        await AuditService.logClientAction(
          user.id,
          user.role,
          'CREATE',
          newClient.id,
          { clientName: newClient.name, clientEmail: newClient.email }
        );
        
        await fetchClients(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Failed to create client. Please try again.');
    }
  };

  const handleUpdateClient = async (clientId: string, clientData: Partial<ClientFormData>) => {
    if (!clientService || !user) return;
    try {
      const updatedClient = await clientService.updateClient(clientId, clientData);
      
      // Log the action
      await AuditService.logClientAction(
        user.id,
        user.role,
        'UPDATE',
        clientId,
        { 
          clientName: updatedClient?.name, 
          clientEmail: updatedClient?.email,
          updatedFields: Object.keys(clientData)
        }
      );
      
      await fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error updating client:', error);
      setError('Failed to update client. Please try again.');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!clientService || !user) return;
    try {
      // Get client details before deletion for audit log
      const clientToDelete = clients.find(c => c.id === clientId);
      
      await clientService.deleteClient(clientId);
      
      // Log the action
      await AuditService.logClientAction(
        user.id,
        user.role,
        'DELETE',
        clientId,
        { 
          clientName: clientToDelete?.name, 
          clientEmail: clientToDelete?.email 
        }
      );
      
      await fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Failed to delete client. Please try again.');
    }
  };

  const handleViewClient = async (client: Client) => {
    if (!user) return;
    
    try {
      // Log the action
      await AuditService.logClientAction(
        user.id,
        user.role,
        'VIEW_PERFORMANCE',
        client.id,
        { clientName: client.name, clientEmail: client.email }
      );
    } catch (error) {
      console.error('Error logging view action:', error);
      // Don't block the user action if logging fails
    }
    
    setSelectedClient(client);
    setViewMode('performance');
  };

  const handleEditClient = (client: Client) => {
    // TODO: Implement client edit form
    console.log('Edit client:', client);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClient(null);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-white text-lg font-medium">Loading client data...</div>
            <div className="text-gray-400 text-sm mt-2">Please wait while we fetch your client information</div>
          </div>
        </div>
      </div>
    );
  }

  // Show performance dashboard if a client is selected
  if (viewMode === 'performance' && selectedClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardNavigation />
        <ClientPerformanceDashboard 
          client={selectedClient} 
          onClose={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Header with Glassmorphism */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Client Management
                </h1>
                <p className="text-lg text-gray-400 mt-2">Manage client accounts and view comprehensive performance metrics</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                onClick={() => {
                  // TODO: Open client creation form
                  console.log('Add new client');
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
              <Button variant="outline" className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white transition-all duration-200 hover:scale-105">
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </div>
          </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-300">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Error Loading Clients</p>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setError(null);
                    fetchClients();
                  }}
                  className="ml-auto bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats Cards with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Clients</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.totalClients || 0}</div>
              <p className="text-xs text-gray-400 mt-1">All client accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Clients</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.activeClients || 0}</div>
              <p className="text-xs text-gray-400 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatCurrency(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-gray-400 mt-1">All time revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Avg Show Rate</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatPercentage(stats?.avgShowRate || 0)}</div>
              <p className="text-xs text-gray-400 mt-1">Across all clients</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Avg Close Rate</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{formatPercentage(stats?.avgCloseRate || 0)}</div>
              <p className="text-xs text-gray-400 mt-1">Across all clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters with Glassmorphism */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50 px-3 py-1">
                Filters & Search
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
              <Filter className="h-6 w-6 text-blue-400" />
              Client Filters
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Search and filter clients by various criteria to find exactly what you need
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-blue-400" />
                  Search Clients
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-slate-500/70 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 hover:border-slate-500/70 transition-all duration-200 backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <Button variant="outline" className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white transition-all duration-200 hover:scale-105">
                  <Filter className="mr-2 h-4 w-4" /> Advanced Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Clients Table with Glassmorphism */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 px-3 py-1">
                Client Accounts
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
              <Building2 className="h-6 w-6 text-emerald-400" />
              Client Accounts
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              {filteredClients.length} clients found • Manage and view detailed client information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{client.name}</h3>
                        <p className="text-gray-400">{client.email}</p>
                        {client.phone && <p className="text-gray-400">{client.phone}</p>}
                        {client.company && <p className="text-gray-400">{client.company}</p>}
                        {client.industry && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg">{getIndustryIcon(client.industry)}</span>
                            <span className="text-sm text-gray-400">{client.industry}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(client.status)}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={() => handleViewClient(client)}
                        title="View client details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        onClick={() => handleEditClient(client)}
                        title="Edit client"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
                            handleDeleteClient(client.id);
                          }
                        }}
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <span className="text-gray-400 block mb-1">Monthly Budget</span>
                      <span className="text-2xl font-bold text-white">
                        {client.monthly_budget ? formatCurrency(client.monthly_budget) : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <span className="text-gray-400 block mb-1">Status</span>
                      <span className="text-2xl font-bold text-green-400 capitalize">{client.status}</span>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <span className="text-gray-400 block mb-1">Industry</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {client.industry || 'N/A'}
                      </span>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <span className="text-gray-400 block mb-1">Contact Person</span>
                      <span className="text-2xl font-bold text-yellow-400">
                        {client.contact_person || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-400 pt-4 border-t border-slate-700/50">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created: {formatDate(client.created_at)}
                    </span>
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Updated: {formatDate(client.updated_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
