'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import FormContainer from '@/components/forms/FormContainer';
import EnhancedFormField from '@/components/forms/EnhancedFormField';
import FormButton from '@/components/forms/FormButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface EnhancedCallFormData {
  // Basic call information
  client_id: string;
  prospect_name: string;
  prospect_email: string;
  prospect_phone: string;
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  loss_reason_id: string;
  notes: string;
  call_duration: string;
  scheduled_at: string;
  completed_at: string;
  
  // Enhanced fields
  closer_first_name: string;
  closer_last_name: string;
  source_of_set_appointment: 'sdr_booked_call' | 'non_sdr_booked_call' | 'email' | 'vsl' | 'self_booking' | '';
  enhanced_call_outcome: 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled' | '';
  initial_payment_collected_on: string;
  customer_full_name: string;
  customer_email: string;
  calls_taken: string;
  setter_first_name: string;
  setter_last_name: string;
  cash_collected_upfront: string;
  total_amount_owed: string;
  prospect_notes: string;
  lead_source: 'organic' | 'ads' | '';
}

export default function EnhancedCallLoggingForm() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<EnhancedCallFormData>({
    // Basic fields
    client_id: '',
    prospect_name: '',
    prospect_email: '',
    prospect_phone: '',
    call_type: 'outbound',
    status: 'completed',
    outcome: 'tbd',
    loss_reason_id: '',
    notes: '',
    call_duration: '',
    scheduled_at: '',
    completed_at: '',
    
    // Enhanced fields
    closer_first_name: '',
    closer_last_name: '',
    source_of_set_appointment: '',
    enhanced_call_outcome: '',
    initial_payment_collected_on: '',
    customer_full_name: '',
    customer_email: '',
    calls_taken: '1',
    setter_first_name: '',
    setter_last_name: '',
    cash_collected_upfront: '',
    total_amount_owed: '',
    prospect_notes: '',
    lead_source: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { 
    validate, 
    getFieldError, 
    hasFieldError, 
    clearErrors, 
    handleFieldChange,
    touchField,
    isFieldTouched,
    getGeneralErrors,
    isFormValid,
    resetForm
  } = useEnhancedFormValidation();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user?.publicMetadata?.agency_id) {
      setFormData(prev => ({
        ...prev,
        client_id: user.publicMetadata.agency_id,
        closer_first_name: user.firstName || '',
        closer_last_name: user.lastName || '',
      }));
    }
  }, [user, isLoaded, router]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Handle enhanced validation
    await handleFieldChange(name, value, newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    clearErrors();

    // Mark all fields as touched for validation
    Object.keys(formData).forEach(fieldName => {
      touchField(fieldName);
    });

    // Prepare data for validation (convert empty strings to null for optional fields)
    const dataToValidate = {
      ...formData,
      prospect_email: formData.prospect_email || null,
      prospect_phone: formData.prospect_phone || null,
      loss_reason_id: formData.loss_reason_id || null,
      notes: formData.notes || null,
      call_duration: formData.call_duration ? parseInt(formData.call_duration) : null,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at) : null,
      completed_at: formData.completed_at ? new Date(formData.completed_at) : null,
      // Enhanced fields
      closer_first_name: formData.closer_first_name || null,
      closer_last_name: formData.closer_last_name || null,
      source_of_set_appointment: formData.source_of_set_appointment || null,
      enhanced_call_outcome: formData.enhanced_call_outcome || null,
      initial_payment_collected_on: formData.initial_payment_collected_on ? new Date(formData.initial_payment_collected_on) : null,
      customer_full_name: formData.customer_full_name || null,
      customer_email: formData.customer_email || null,
      calls_taken: formData.calls_taken ? parseInt(formData.calls_taken) : null,
      setter_first_name: formData.setter_first_name || null,
      setter_last_name: formData.setter_last_name || null,
      cash_collected_upfront: formData.cash_collected_upfront ? parseFloat(formData.cash_collected_upfront) : null,
      total_amount_owed: formData.total_amount_owed ? parseFloat(formData.total_amount_owed) : null,
      prospect_notes: formData.prospect_notes || null,
      lead_source: formData.lead_source || null,
    };

    // Validate form data with enhanced validation
    const validationResult = await validate(dataToValidate);
    
    if (!validationResult.isValid) {
      setLoading(false);
      
      // Show general errors if any
      const generalErrors = getGeneralErrors();
      if (generalErrors.length > 0) {
        setError(generalErrors.join(', '));
      }
      
      return;
    }

    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToValidate),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create call');
      }

      setSuccess(true);
      resetForm();
      
      // Redirect to calls list after successful creation
      setTimeout(() => {
        router.push('/calls');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create call');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Call Logged Successfully!
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg mt-2">
                You will be redirected to the calls list shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-gray-300 text-base">Your enhanced call has been logged successfully.</p>
                <div className="mt-6 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section with improved accessibility */}
        <header className="text-center mb-12" role="banner">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4 leading-tight">
            Enhanced Call Logging
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Comprehensive call tracking and analytics with advanced metrics
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10" role="form" aria-label="Enhanced Call Logging Form">
          {/* Basic Call Information */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-primary/10 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-slate-900">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" aria-hidden="true"></div>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50 px-3 py-1 text-sm font-medium">
                  Basic Info
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold text-white" id="basic-info-heading">
                Call Information
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Essential details about the call and prospect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" aria-labelledby="basic-info-heading">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <EnhancedFormField
                  label="Prospect Name"
                  name="prospect_name"
                  type="text"
                  value={formData.prospect_name}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_name')}
                  placeholder="Enter prospect name"
                  required
                  isValid={!hasFieldError('prospect_name') && formData.prospect_name.length >= 2}
                  isTouched={isFieldTouched('prospect_name')}
                />

                <EnhancedFormField
                  label="Prospect Email"
                  name="prospect_email"
                  type="email"
                  value={formData.prospect_email}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_email')}
                  placeholder="Enter prospect email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Prospect Phone"
                  name="prospect_phone"
                  type="text"
                  value={formData.prospect_phone}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_phone')}
                  placeholder="Enter prospect phone"
                />

                <EnhancedFormField
                  label="Call Type"
                  name="call_type"
                  type="select"
                  value={formData.call_type}
                  onChange={handleInputChange}
                  error={getFieldError('call_type')}
                  required
                >
                  <option value="">Select call type</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </EnhancedFormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Status"
                  name="status"
                  type="select"
                  value={formData.status}
                  onChange={handleInputChange}
                  error={getFieldError('status')}
                  required
                >
                  <option value="">Select status</option>
                  <option value="completed">Completed</option>
                  <option value="no-show">No Show</option>
                  <option value="rescheduled">Rescheduled</option>
                </EnhancedFormField>

                <EnhancedFormField
                  label="Call Duration (minutes)"
                  name="call_duration"
                  type="number"
                  value={formData.call_duration}
                  onChange={handleInputChange}
                  error={getFieldError('call_duration')}
                  placeholder="Enter duration in minutes"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Scheduled At"
                  name="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={handleInputChange}
                  error={getFieldError('scheduled_at')}
                />

                <EnhancedFormField
                  label="Completed At"
                  name="completed_at"
                  type="datetime-local"
                  value={formData.completed_at}
                  onChange={handleInputChange}
                  error={getFieldError('completed_at')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Call Details */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Badge variant="outline" className="bg-green-600/20 text-green-300 border-green-500/50 px-3 py-1">
                  Enhanced
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold text-white">
                Call Details & Outcomes
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Detailed tracking for comprehensive analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Source of Set Appointment"
                  name="source_of_set_appointment"
                  type="select"
                  value={formData.source_of_set_appointment}
                  onChange={handleInputChange}
                  error={getFieldError('source_of_set_appointment')}
                  required
                >
                  <option value="">Select source</option>
                  <option value="sdr_booked_call">SDR Booked Call</option>
                  <option value="non_sdr_booked_call">Non SDR Booked Call</option>
                  <option value="email">Email</option>
                  <option value="vsl">VSL</option>
                  <option value="self_booking">Self Booking</option>
                </EnhancedFormField>

                <EnhancedFormField
                  label="Call Outcome"
                  name="enhanced_call_outcome"
                  type="select"
                  value={formData.enhanced_call_outcome}
                  onChange={handleInputChange}
                  error={getFieldError('enhanced_call_outcome')}
                  required
                >
                  <option value="">Select outcome</option>
                  <option value="no_show">No Show</option>
                  <option value="no_close">No Close</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disqualified">Disqualified</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="payment_plan">Payment Plan</option>
                  <option value="deposit">Deposit</option>
                  <option value="closed_paid_in_full">Closed/Paid In Full</option>
                  <option value="follow_up_call_scheduled">Follow Up Call Scheduled</option>
                </EnhancedFormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Lead Source"
                  name="lead_source"
                  type="select"
                  value={formData.lead_source}
                  onChange={handleInputChange}
                  error={getFieldError('lead_source')}
                  required
                >
                  <option value="">Select lead source</option>
                  <option value="organic">Organic</option>
                  <option value="ads">Ads</option>
                </EnhancedFormField>

                <EnhancedFormField
                  label="Initial Payment Collected On"
                  name="initial_payment_collected_on"
                  type="date"
                  value={formData.initial_payment_collected_on}
                  onChange={handleInputChange}
                  error={getFieldError('initial_payment_collected_on')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50 px-3 py-1">
                  Team
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold text-white">
                Team Information
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Closer and setter details for attribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Closer First Name"
                  name="closer_first_name"
                  type="text"
                  value={formData.closer_first_name}
                  onChange={handleInputChange}
                  error={getFieldError('closer_first_name')}
                  placeholder="Enter closer first name"
                />

                <EnhancedFormField
                  label="Closer Last Name"
                  name="closer_last_name"
                  type="text"
                  value={formData.closer_last_name}
                  onChange={handleInputChange}
                  error={getFieldError('closer_last_name')}
                  placeholder="Enter closer last name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Setter First Name"
                  name="setter_first_name"
                  type="text"
                  value={formData.setter_first_name}
                  onChange={handleInputChange}
                  error={getFieldError('setter_first_name')}
                  placeholder="Enter setter first name"
                />

                <EnhancedFormField
                  label="Setter Last Name"
                  name="setter_last_name"
                  type="text"
                  value={formData.setter_last_name}
                  onChange={handleInputChange}
                  error={getFieldError('setter_last_name')}
                  placeholder="Enter setter last name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer & Payment Information */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <Badge variant="outline" className="bg-yellow-600/20 text-yellow-300 border-yellow-500/50 px-3 py-1">
                  Payment
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold text-white">
                Customer & Payment Details
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Customer information and payment tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedFormField
                  label="Customer Full Name"
                  name="customer_full_name"
                  type="text"
                  value={formData.customer_full_name}
                  onChange={handleInputChange}
                  error={getFieldError('customer_full_name')}
                  placeholder="Enter customer full name"
                />

                <EnhancedFormField
                  label="Customer Email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  error={getFieldError('customer_email')}
                  placeholder="Enter customer email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EnhancedFormField
                  label="Calls Taken"
                  name="calls_taken"
                  type="number"
                  value={formData.calls_taken}
                  onChange={handleInputChange}
                  error={getFieldError('calls_taken')}
                  placeholder="Number of calls"
                />

                <EnhancedFormField
                  label="Cash Collected Upfront"
                  name="cash_collected_upfront"
                  type="number"
                  value={formData.cash_collected_upfront}
                  onChange={handleInputChange}
                  error={getFieldError('cash_collected_upfront')}
                  placeholder="0.00"
                  step="0.01"
                  isValid={!hasFieldError('cash_collected_upfront') && formData.cash_collected_upfront && parseFloat(formData.cash_collected_upfront) >= 0}
                  isTouched={isFieldTouched('cash_collected_upfront')}
                />

                <EnhancedFormField
                  label="Total Amount Owed"
                  name="total_amount_owed"
                  type="number"
                  value={formData.total_amount_owed}
                  onChange={handleInputChange}
                  error={getFieldError('total_amount_owed')}
                  placeholder="0.00"
                  step="0.01"
                  isValid={!hasFieldError('total_amount_owed') && formData.total_amount_owed && parseFloat(formData.total_amount_owed) >= 0}
                  isTouched={isFieldTouched('total_amount_owed')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-gray-500/10 transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <Badge variant="outline" className="bg-gray-600/20 text-gray-300 border-gray-500/50 px-3 py-1">
                  Notes
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold text-white">
                Additional Information
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Notes and additional details about the call
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EnhancedFormField
                label="Call Notes"
                name="notes"
                type="textarea"
                value={formData.notes}
                onChange={handleInputChange}
                error={getFieldError('notes')}
                placeholder="Enter call notes and details"
              />

              <EnhancedFormField
                label="Prospect Notes"
                name="prospect_notes"
                type="textarea"
                value={formData.prospect_notes}
                onChange={handleInputChange}
                error={getFieldError('prospect_notes')}
                placeholder="Additional notes about the prospect"
              />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-900/20 backdrop-blur-xl border border-red-500/50 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-400 text-center">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardContent className="pt-8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <FormButton
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/calls')}
                  className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Cancel and return to calls list"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </FormButton>
                <FormButton
                  type="submit"
                  loading={loading}
                  disabled={loading || !isFormValid}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Submit enhanced call logging form"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {loading ? 'Logging Call...' : 'Log Enhanced Call'}
                </FormButton>
              </div>
              {!isFormValid && (
                <p className="text-sm text-amber-400 mt-4 text-center" role="alert">
                  Please complete all required fields to submit the form
                </p>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
