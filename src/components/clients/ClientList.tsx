'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { 
  Client, 
  getClientStatusColor,
  getClientStatusIcon,
  getIndustryIcon,
  formatCurrency,
  formatDate
} from '@/lib/services/clientService';
import { ClientDetails } from './ClientDetails';
import { ClientForm } from './ClientForm';

interface ClientListProps {
  clients: Client[];
  onClientUpdate: () => void;
  onCreateClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export function ClientList({ 
  clients, 
  onClientUpdate, 
  onCreateClient, 
  onEditClient, 
  onDeleteClient 
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Filter clients based on search and filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean)));

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      onDeleteClient(clientId);
    }
  };

  const handleFormClose = () => {
    setShowClientForm(false);
    setEditingClient(null);
    onClientUpdate();
  };

  const handleClientDetailsClose = () => {
    setSelectedClient(null);
  };

  const handleClientDetailsEdit = () => {
    if (selectedClient) {
      setEditingClient(selectedClient);
      setShowClientForm(true);
      setSelectedClient(null);
    }
  };

  const handleClientDetailsDelete = () => {
    if (selectedClient) {
      handleDeleteClient(selectedClient.id);
      setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Directory</h2>
          <p className="text-muted-foreground">
            Manage and view all client accounts
          </p>
        </div>
        <Button onClick={onCreateClient} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredClients.length} of {clients.length} clients
        </span>
        {(searchTerm || statusFilter !== 'all' || industryFilter !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setIndustryFilter('all');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Client Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No clients found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' || industryFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Get started by adding your first client'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          {client.company && (
                            <p className="text-sm text-muted-foreground">{client.company}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {client.industry ? (
                        <div className="flex items-center gap-1">
                          {getIndustryIcon(client.industry)}
                          <span className="text-sm">{client.industry}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getClientStatusColor(client.status)}
                      >
                        {getClientStatusIcon(client.status)} {client.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {client.monthly_budget ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatCurrency(client.monthly_budget)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(client.created_at)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClient(client)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          onEdit={handleClientDetailsEdit}
          onDelete={handleClientDetailsDelete}
          onClose={handleClientDetailsClose}
        />
      )}

      {/* Client Form Modal */}
      {showClientForm && (
        <ClientForm
          client={editingClient}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}
    </div>
  );
}
