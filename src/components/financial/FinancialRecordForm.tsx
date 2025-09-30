'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FinancialRecord, FinancialRecordFormData } from '@/lib/services/financialService';
import { supabase } from '@/lib/supabase';

interface FinancialRecordFormProps {
  agencyId: string;
  record?: FinancialRecord;
  onSubmit: (data: FinancialRecordFormData) => Promise<void>;
  onCancel: () => void;
}

const schema = yup.object({
  campaign_id: yup.string().optional(),
  client_id: yup.string().optional(),
  integration_source_id: yup.string().optional(),
  transaction_date: yup.string().required('Transaction date is required'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  payment_status: yup.string().oneOf(['pending', 'paid', 'failed', 'refunded']).required('Payment status is required'),
  transaction_type: yup.string().oneOf(['ad_spend', 'payment', 'refund', 'fee', 'revenue', 'expense', 'adjustment', 'commission', 'bonus', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax', 'other']).required('Transaction type is required'),
  currency: yup.string().required('Currency is required'),
  reference_number: yup.string().optional(),
  description: yup.string().optional(),
});

export function FinancialRecordForm({ agencyId, record, onSubmit, onCancel }: FinancialRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [integrationSources, setIntegrationSources] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(
    record ? new Date(record.transaction_date) : new Date()
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FinancialRecordFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      campaign_id: record?.campaign_id || '',
      client_id: record?.client_id || '',
      integration_source_id: record?.integration_source_id || '',
      transaction_date: record?.transaction_date || new Date().toISOString().split('T')[0],
      amount: record?.amount || 0,
      payment_status: record?.payment_status || 'pending',
      transaction_type: record?.transaction_type || 'payment',
      currency: record?.currency || 'USD',
      reference_number: record?.reference_number || '',
      description: record?.description || '',
    }
  });

  const transactionType = watch('transaction_type');

  useEffect(() => {
    loadDropdownData();
  }, [agencyId]);

  useEffect(() => {
    if (date) {
      setValue('transaction_date', format(date, 'yyyy-MM-dd'));
    }
  }, [date, setValue]);

  const loadDropdownData = async () => {
    try {
      // Load campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('agency_id', agencyId)
        .order('name');
      setCampaigns(campaignsData || []);

      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .eq('agency_id', agencyId)
        .order('name');
      setClients(clientsData || []);

      // Load integration sources
      const { data: sourcesData } = await supabase
        .from('integration_sources')
        .select('id, name')
        .eq('agency_id', agencyId)
        .order('name');
      setIntegrationSources(sourcesData || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const onFormSubmit = async (data: FinancialRecordFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeDescription = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Client payment received';
      case 'revenue':
        return 'Revenue from services';
      case 'ad_spend':
        return 'Advertising expenditure';
      case 'marketing':
        return 'Marketing campaign costs';
      case 'refund':
        return 'Refund issued to client';
      case 'fee':
        return 'Service or platform fee';
      case 'commission':
        return 'Sales commission payment';
      case 'bonus':
        return 'Performance bonus';
      case 'salary':
        return 'Employee salary payment';
      case 'equipment':
        return 'Equipment purchase or rental';
      case 'software':
        return 'Software license or subscription';
      case 'travel':
        return 'Business travel expenses';
      case 'office':
        return 'Office rent and utilities';
      case 'consulting':
        return 'Consulting services';
      case 'training':
        return 'Training and development';
      case 'legal':
        return 'Legal services and fees';
      case 'insurance':
        return 'Insurance premiums';
      case 'tax':
        return 'Tax payments';
      case 'expense':
        return 'General business expense';
      case 'adjustment':
        return 'Financial adjustment or correction';
      case 'other':
        return 'Other financial transaction';
      default:
        return '';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? 'Edit Financial Record' : 'Create Financial Record'}
          </DialogTitle>
          <DialogDescription>
            {record ? 'Update the financial record details' : 'Add a new financial transaction'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Transaction Type and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setValue('transaction_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="ad_spend">Ad Spend</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="expense">General Expense</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.transaction_type && (
                <p className="text-sm text-red-600">{errors.transaction_type.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {getTransactionTypeDescription(transactionType)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount')}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Date and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transaction Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.transaction_date && (
                <p className="text-sm text-red-600">{errors.transaction_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={watch('currency')}
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-red-600">{errors.currency.message}</p>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              value={watch('payment_status')}
              onValueChange={(value) => setValue('payment_status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_status && (
              <p className="text-sm text-red-600">{errors.payment_status.message}</p>
            )}
          </div>

          {/* Campaign and Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campaign (Optional)</Label>
              <Select
                value={watch('campaign_id') || ''}
                onValueChange={(value) => setValue('campaign_id', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No campaign</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client (Optional)</Label>
              <Select
                value={watch('client_id') || ''}
                onValueChange={(value) => setValue('client_id', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Integration Source */}
          <div className="space-y-2">
            <Label htmlFor="integration_source_id">Integration Source (Optional)</Label>
            <Select
              value={watch('integration_source_id') || ''}
              onValueChange={(value) => setValue('integration_source_id', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select integration source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No integration source</SelectItem>
                {integrationSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference Number (Optional)</Label>
            <Input
              id="reference_number"
              {...register('reference_number')}
              placeholder="e.g., INV-2024-001, TXN-123456"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional details about this transaction..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {record ? 'Update Record' : 'Create Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
