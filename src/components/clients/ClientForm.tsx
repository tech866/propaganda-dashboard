'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  DollarSign,
  Calendar,
  FileText,
  Save,
  X
} from 'lucide-react';
import { Client, ClientFormData } from '@/lib/services/clientService';

interface ClientFormProps {
  client?: Client | null;
  onSave: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
}

const clientSchema = yup.object({
  name: yup.string().required('Client name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().optional(),
  company: yup.string().optional(),
  industry: yup.string().optional(),
  status: yup.string().oneOf(['active', 'inactive', 'pending', 'suspended']).required('Status is required'),
  billing_address: yup.string().optional(),
  billing_city: yup.string().optional(),
  billing_state: yup.string().optional(),
  billing_zip: yup.string().optional(),
  billing_country: yup.string().optional(),
  contact_person: yup.string().optional(),
  notes: yup.string().optional(),
  monthly_budget: yup.number().min(0, 'Budget must be positive').optional(),
  contract_start_date: yup.string().optional(),
  contract_end_date: yup.string().optional(),
});

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Education',
  'Real Estate',
  'Automotive',
  'Food & Beverage',
  'Travel',
  'Entertainment',
  'Manufacturing',
  'Consulting',
  'Other'
];

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      status: 'active',
      billing_address: '',
      billing_city: '',
      billing_state: '',
      billing_zip: '',
      billing_country: 'United States',
      contact_person: '',
      notes: '',
      monthly_budget: 0,
      contract_start_date: '',
      contract_end_date: '',
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        industry: client.industry || '',
        status: client.status,
        billing_address: client.billing_address || '',
        billing_city: client.billing_city || '',
        billing_state: client.billing_state || '',
        billing_zip: client.billing_zip || '',
        billing_country: client.billing_country || 'United States',
        contact_person: client.contact_person || '',
        notes: client.notes || '',
        monthly_budget: client.monthly_budget || 0,
        contract_start_date: client.contract_start_date || '',
        contract_end_date: client.contract_end_date || '',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      setError(null);
      await onSave(data);
    } catch (err) {
      console.error('Error saving client:', err);
      setError('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
          <DialogDescription>
            {client ? 'Update client information and settings' : 'Create a new client account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential client details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter client name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="client@company.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(value) => setValue('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select onValueChange={(value) => setValue('status', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Billing Information
              </CardTitle>
              <CardDescription>
                Client billing address and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billing_address">Billing Address</Label>
                <Input
                  id="billing_address"
                  {...register('billing_address')}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_city">City</Label>
                  <Input
                    id="billing_city"
                    {...register('billing_city')}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_state">State</Label>
                  <Input
                    id="billing_state"
                    {...register('billing_state')}
                    placeholder="State"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_zip">ZIP Code</Label>
                  <Input
                    id="billing_zip"
                    {...register('billing_zip')}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_country">Country</Label>
                <Input
                  id="billing_country"
                  {...register('billing_country')}
                  placeholder="United States"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business Information
              </CardTitle>
              <CardDescription>
                Contract details and business relationship information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    {...register('contact_person')}
                    placeholder="Primary contact person"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_budget">Monthly Budget</Label>
                  <Input
                    id="monthly_budget"
                    type="number"
                    {...register('monthly_budget')}
                    placeholder="0"
                    min="0"
                    step="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_start_date">Contract Start Date</Label>
                  <Input
                    id="contract_start_date"
                    type="date"
                    {...register('contract_start_date')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_end_date">Contract End Date</Label>
                  <Input
                    id="contract_end_date"
                    type="date"
                    {...register('contract_end_date')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes about the client..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}