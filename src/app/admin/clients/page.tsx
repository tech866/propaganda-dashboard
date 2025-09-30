'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import DashboardNavigation from '@/components/navigation/DashboardNavigation';
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

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  totalCalls: number;
  showRate: number;
  closeRate: number;
  revenue: number;
  margin: number;
  lastActivity: string;
}

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
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else if (user && !hasAnyRole(['admin', 'ceo'])) {
      router.push('/dashboard');
    }
  }, [user, router, hasAnyRole]);

  useEffect(() => {
    if (user && hasAnyRole(['admin', 'ceo'])) {
      fetchClients();
    }
  }, [user, hasAnyRole]);

  // Show loading state while checking authentication and roles
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have required role
  if (user && !hasAnyRole(['admin', 'ceo'])) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-h2">Access Denied</CardTitle>
            <CardDescription>You don&apos;t have permission to access client management.</CardDescription>
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

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with actual API calls
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'TechCorp Inc.',
          email: 'contact@techcorp.com',
          phone: '+1 (555) 123-4567',
          status: 'active',
          createdAt: '2024-01-15',
          totalCalls: 234,
          showRate: 85.2,
          closeRate: 48.7,
          revenue: 892000,
          margin: 70.0,
          lastActivity: '2024-09-28'
        },
        {
          id: '2',
          name: 'StartupXYZ',
          email: 'hello@startupxyz.com',
          phone: '+1 (555) 234-5678',
          status: 'active',
          createdAt: '2024-02-20',
          totalCalls: 198,
          showRate: 78.9,
          closeRate: 42.1,
          revenue: 650000,
          margin: 68.5,
          lastActivity: '2024-09-27'
        },
        {
          id: '3',
          name: 'GlobalTech Solutions',
          email: 'info@globaltech.com',
          phone: '+1 (555) 345-6789',
          status: 'active',
          createdAt: '2024-03-10',
          totalCalls: 167,
          showRate: 72.3,
          closeRate: 38.9,
          revenue: 523000,
          margin: 65.2,
          lastActivity: '2024-09-26'
        },
        {
          id: '4',
          name: 'InnovateLab',
          email: 'team@innovatelab.com',
          phone: '+1 (555) 456-7890',
          status: 'active',
          createdAt: '2024-04-05',
          totalCalls: 189,
          showRate: 81.7,
          closeRate: 46.3,
          revenue: 734000,
          margin: 72.1,
          lastActivity: '2024-09-28'
        },
        {
          id: '5',
          name: 'Future Systems',
          email: 'contact@futuresystems.com',
          phone: '+1 (555) 567-8901',
          status: 'pending',
          createdAt: '2024-09-20',
          totalCalls: 12,
          showRate: 66.7,
          closeRate: 25.0,
          revenue: 45000,
          margin: 60.0,
          lastActivity: '2024-09-25'
        },
        {
          id: '6',
          name: 'DataFlow Corp',
          email: 'info@dataflow.com',
          phone: '+1 (555) 678-9012',
          status: 'inactive',
          createdAt: '2024-01-30',
          totalCalls: 89,
          showRate: 71.9,
          closeRate: 35.2,
          revenue: 234000,
          margin: 62.8,
          lastActivity: '2024-08-15'
        }
      ];

      const mockStats: ClientStats = {
        totalClients: mockClients.length,
        activeClients: mockClients.filter(c => c.status === 'active').length,
        totalRevenue: mockClients.reduce((sum, c) => sum + c.revenue, 0),
        avgShowRate: mockClients.reduce((sum, c) => sum + c.showRate, 0) / mockClients.length,
        avgCloseRate: mockClients.reduce((sum, c) => sum + c.closeRate, 0) / mockClients.length
      };

      setClients(mockClients);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading client data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-display">Client Management</h1>
                <p className="text-body-lg text-muted-foreground">Manage client accounts and view performance metrics</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
              <Button variant="secondary">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All client accounts</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.activeClients || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Show Rate</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatPercentage(stats?.avgShowRate || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all clients</p>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Close Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatPercentage(stats?.avgCloseRate || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Filters</CardTitle>
            <CardDescription>Search and filter clients by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-modern"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <Button variant="secondary">
                  <Filter className="mr-2 h-4 w-4" /> More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Client Accounts</CardTitle>
            <CardDescription>{filteredClients.length} clients found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="card-modern p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-lg">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(client.status)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Total Calls:</span>
                      <span className="ml-2 font-medium text-foreground">{client.totalCalls}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Show Rate:</span>
                      <span className="ml-2 font-medium text-foreground">{formatPercentage(client.showRate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Close Rate:</span>
                      <span className="ml-2 font-medium text-foreground">{formatPercentage(client.closeRate)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="ml-2 font-medium text-foreground">{formatCurrency(client.revenue)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Created: {new Date(client.createdAt).toLocaleDateString()}</span>
                    <span>Last Activity: {new Date(client.lastActivity).toLocaleDateString()}</span>
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
