'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FinancialService, 
  FinancialRecord, 
  formatCurrency, 
  formatDate,
  getTransactionTypeColor,
  getPaymentStatusColor,
  getTransactionTypeIcon
} from '@/lib/services/financialService';
import { FinancialRecordForm } from './FinancialRecordForm';
import { FinancialRecordDetails } from './FinancialRecordDetails';
import { FinancialAnalytics } from './FinancialAnalytics';
import { RoleBasedAccess, AgencyUsersAndAbove, CanViewFinancialData } from '@/components/auth/RoleBasedAccess';

interface FinancialManagementProps {
  agencyId: string;
}

export function FinancialManagement({ agencyId }: FinancialManagementProps) {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<FinancialRecord | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const financialService = new FinancialService(agencyId);

  useEffect(() => {
    loadRecords();
  }, [agencyId]);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financialService.getFinancialRecords();
      setRecords(data);
    } catch (err) {
      console.error('Error loading financial records:', err);
      setError('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (recordData: any) => {
    try {
      await financialService.createFinancialRecord(recordData);
      await loadRecords();
      setShowForm(false);
    } catch (err) {
      console.error('Error creating financial record:', err);
      throw err;
    }
  };

  const handleUpdateRecord = async (recordId: string, recordData: any) => {
    try {
      await financialService.updateFinancialRecord(recordId, recordData);
      await loadRecords();
      setEditingRecord(null);
    } catch (err) {
      console.error('Error updating financial record:', err);
      throw err;
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this financial record?')) {
      try {
        await financialService.deleteFinancialRecord(recordId);
        await loadRecords();
      } catch (err) {
        console.error('Error deleting financial record:', err);
        alert('Failed to delete financial record');
      }
    }
  };

  // Filter records based on search and filters
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.transaction_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.payment_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate summary statistics
  const totalRecords = records.length;
  const totalRevenue = records
    .filter(r => r.transaction_type === 'payment')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = records
    .filter(r => ['ad_spend', 'fee'].includes(r.transaction_type))
    .reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadRecords} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Records</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage and track all financial transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(true)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <AgencyUsersAndAbove>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Record
            </Button>
          </AgencyUsersAndAbove>
        </div>
      </div>

      {/* Summary Cards */}
      <CanViewFinancialData
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRecords}</div>
                <p className="text-xs text-muted-foreground">
                  Financial transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Access Level</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Limited</div>
                <p className="text-xs text-muted-foreground">
                  Contact admin for full access
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground">
                  System operational
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Now</div>
                <p className="text-xs text-muted-foreground">
                  Real-time data
                </p>
              </CardContent>
            </Card>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                Ad spend & fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue - Expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords}</div>
              <p className="text-xs text-muted-foreground">
                Financial transactions
              </p>
            </CardContent>
          </Card>
        </div>
      </CanViewFinancialData>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns, clients, or reference numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Types</option>
                <option value="payment">Payment</option>
                <option value="revenue">Revenue</option>
                <option value="ad_spend">Ad Spend</option>
                <option value="marketing">Marketing</option>
                <option value="refund">Refund</option>
                <option value="fee">Fee</option>
                <option value="commission">Commission</option>
                <option value="bonus">Bonus</option>
                <option value="salary">Salary</option>
                <option value="equipment">Equipment</option>
                <option value="software">Software</option>
                <option value="travel">Travel</option>
                <option value="office">Office</option>
                <option value="consulting">Consulting</option>
                <option value="training">Training</option>
                <option value="legal">Legal</option>
                <option value="insurance">Insurance</option>
                <option value="tax">Tax</option>
                <option value="expense">General Expense</option>
                <option value="adjustment">Adjustment</option>
                <option value="other">Other</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} of {totalRecords} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {formatDate(record.transaction_date)}
                  </TableCell>
                  <TableCell>{record.campaign_name}</TableCell>
                  <TableCell>{record.client_name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTransactionTypeColor(record.transaction_type)}`}
                    >
                      {getTransactionTypeIcon(record.transaction_type)} {record.transaction_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium ${
                    record.transaction_type === 'payment' ? 'text-green-600' : 
                    ['ad_spend', 'fee'].includes(record.transaction_type) ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {record.transaction_type === 'payment' ? '+' : '-'}{formatCurrency(record.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPaymentStatusColor(record.payment_status)}`}
                    >
                      {record.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.integration_source_name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {record.reference_number}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setViewingRecord(record)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <AgencyUsersAndAbove>
                          <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AgencyUsersAndAbove>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {showForm && (
        <FinancialRecordForm
          agencyId={agencyId}
          onSubmit={handleCreateRecord}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingRecord && (
        <FinancialRecordForm
          agencyId={agencyId}
          record={editingRecord}
          onSubmit={(data) => handleUpdateRecord(editingRecord.id, data)}
          onCancel={() => setEditingRecord(null)}
        />
      )}

      {viewingRecord && (
        <FinancialRecordDetails
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}

      {showAnalytics && (
        <FinancialAnalytics
          agencyId={agencyId}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
}
