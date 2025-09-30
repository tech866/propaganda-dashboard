'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useAgency } from '@/contexts/AgencyContext';
import { 
  ClientService, 
  Client, 
  ClientFormData,
  getClientStatusColor,
  getClientStatusIcon,
  getIndustryIcon,
  formatCurrency,
  formatDate
} from '@/lib/services/clientService';
import { ClientForm } from './ClientForm';
import { ClientDetails } from './ClientDetails';
import { ClientPerformanceDashboard } from './ClientPerformanceDashboard';
import { ClientAnalytics } from './ClientAnalytics';

export function ClientManagement() {
  const { user } = useRole();
  const { agency } = useAgency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // UI state
  const [showClientForm, setShowClientForm] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  // Initialize client service
  const clientService = agency?.id ? new ClientService(agency.id) : null;

  // Load clients
  const loadClients = async () => {
    if (!clientService) return;
    
    try {
      setLoading(true);
      setError(null);
      const clientsData = await clientService.getClients();
      setClients(clientsData);
      setFilteredClients(clientsData);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load clients on component mount
  useEffect(() => {
    if (agency?.id) {
      loadClients();
    }
  }, [agency?.id]);

  // Filter clients based on search and filters
  useEffect(() => {
    let filtered = clients;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(client => client.industry === industryFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, statusFilter, industryFilter]);

  // Handle client creation
  const handleCreateClient = async (clientData: ClientFormData) => {
    if (!clientService) return;
    
    try {
      const newClient = await clientService.createClient(clientData);
      if (newClient) {
        setClients(prev => [newClient, ...prev]);
        setShowClientForm(false);
      }
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  };

  // Handle client update
  const handleUpdateClient = async (clientId: string, clientData: Partial<ClientFormData>) => {
    if (!clientService) return;
    
    try {
      const updatedClient = await clientService.updateClient(clientId, clientData);
      if (updatedClient) {
        setClients(prev => prev.map(client => 
          client.id === clientId ? updatedClient : client
        ));
        setEditingClient(null);
        setShowClientForm(false);
      }
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  // Handle client deletion
  const handleDeleteClient = async (clientId: string) => {
    if (!clientService) return;
    
    try {
      const success = await clientService.deleteClient(clientId);
      if (success) {
        setClients(prev => prev.filter(client => client.id !== clientId));
        setSelectedClient(null);
        setShowClientDetails(false);
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Get unique industries for filter
  const industries = Array.from(new Set(clients.map(client => client.industry).filter(Boolean)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
            <p className="text-muted-foreground">Manage client accounts and view performance</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
            <p className="text-muted-foreground">Manage client accounts and view performance</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadClients} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage client accounts and view performance for {agency?.name || 'your agency'}
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingClient(null);
            setShowClientForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(clients.reduce((sum, client) => sum + (client.monthly_budget || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Monthly budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{industries.length}</div>
            <p className="text-xs text-muted-foreground">Different industries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>
            Filter and search through your client database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry || ''}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setIndustryFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Client Directory
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Client Directory */}
          <Card>
            <CardHeader>
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>
                {filteredClients.length} of {clients.length} clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{client.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{client.company}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getClientStatusColor(client.status)}
                        >
                          {getClientStatusIcon(client.status)} {client.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Phone:</span>
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.industry && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Industry:</span>
                            <span className="flex items-center gap-1">
                              {getIndustryIcon(client.industry)} {client.industry}
                            </span>
                          </div>
                        )}
                        {client.monthly_budget && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="font-medium">{formatCurrency(client.monthly_budget)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          Created {formatDate(client.created_at)}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowClientDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingClient(client);
                              setShowClientForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {selectedClient ? (
            <ClientPerformanceDashboard client={selectedClient} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Client</h3>
                  <p className="text-muted-foreground">
                    Choose a client from the directory to view their performance metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {selectedClient ? (
            <ClientAnalytics client={selectedClient} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Client</h3>
                  <p className="text-muted-foreground">
                    Choose a client from the directory to view their analytics.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          client={editingClient}
          onSave={editingClient ? 
            (data) => handleUpdateClient(editingClient.id, data) :
            handleCreateClient
          }
          onCancel={() => {
            setShowClientForm(false);
            setEditingClient(null);
          }}
        />
      )}

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <ClientDetails
          client={selectedClient}
          onEdit={() => {
            setShowClientDetails(false);
            setEditingClient(selectedClient);
            setShowClientForm(true);
          }}
          onDelete={() => handleDeleteClient(selectedClient.id)}
          onClose={() => {
            setShowClientDetails(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}