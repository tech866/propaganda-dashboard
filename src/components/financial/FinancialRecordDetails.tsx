'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Building2, 
  Target, 
  FileText, 
  Hash,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { FinancialRecord, formatCurrency, formatDate, getTransactionTypeColor, getPaymentStatusColor, getTransactionTypeIcon } from '@/lib/services/financialService';

interface FinancialRecordDetailsProps {
  record: FinancialRecord;
  onClose: () => void;
}

export function FinancialRecordDetails({ record, onClose }: FinancialRecordDetailsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAmountIcon = (type: string) => {
    switch (type) {
      case 'payment':
      case 'revenue':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'ad_spend':
      case 'fee':
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'refund':
        return <RotateCcw className="h-5 w-5 text-blue-600" />;
      case 'adjustment':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'payment':
      case 'revenue':
        return 'text-green-600';
      case 'ad_spend':
      case 'fee':
      case 'expense':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      case 'adjustment':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'payment':
      case 'revenue':
        return '+';
      case 'ad_spend':
      case 'fee':
      case 'expense':
        return '-';
      case 'refund':
        return '-';
      case 'adjustment':
        return '±';
      default:
        return '';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTransactionTypeIcon(record.transaction_type)}
            Financial Record Details
          </DialogTitle>
          <DialogDescription>
            Complete information for this financial transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transaction Overview</span>
                <Badge 
                  variant="outline" 
                  className={`${getTransactionTypeColor(record.transaction_type)}`}
                >
                  {getTransactionTypeIcon(record.transaction_type)} {record.transaction_type.replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAmountIcon(record.transaction_type)}
                  <span className="font-medium">Amount</span>
                </div>
                <span className={`text-2xl font-bold ${getAmountColor(record.transaction_type)}`}>
                  {getAmountPrefix(record.transaction_type)}{formatCurrency(record.amount)}
                </span>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Transaction Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(record.transaction_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">{record.currency}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(record.payment_status)}
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`${getPaymentStatusColor(record.payment_status)}`}
                >
                  {getStatusIcon(record.payment_status)} {record.payment_status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last updated: {formatDate(record.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Entities */}
          {(record.campaign_name || record.client_name || record.integration_source_name) && (
            <Card>
              <CardHeader>
                <CardTitle>Related Entities</CardTitle>
                <CardDescription>Campaign, client, and integration source information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {record.campaign_name && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Campaign</p>
                      <p className="text-sm text-muted-foreground">{record.campaign_name}</p>
                    </div>
                  </div>
                )}
                
                {record.client_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Client</p>
                      <p className="text-sm text-muted-foreground">{record.client_name}</p>
                    </div>
                  </div>
                )}
                
                {record.integration_source_name && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Integration Source</p>
                      <p className="text-sm text-muted-foreground">{record.integration_source_name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reference Information */}
          {(record.reference_number || record.description) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Reference Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {record.reference_number && (
                  <div>
                    <p className="text-sm font-medium">Reference Number</p>
                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                      {record.reference_number}
                    </p>
                  </div>
                )}
                
                {record.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {record.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Record creation and modification details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Record ID</p>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {record.id}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Agency ID</p>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {record.agency_id}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(record.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{formatDate(record.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
