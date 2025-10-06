'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createCallSchema } from '@/lib/validation/clientSchemas';
import { useTrafficSourceClassification } from '@/hooks/useTrafficSourceClassification';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';

interface EnhancedCallFormData {
  client_id: string;
  // Split prospect name
  prospect_first_name: string;
  prospect_last_name: string;
  prospect_email: string;
  prospect_phone: string;
  // Company name (pre-selected from workspace)
  company_name: string;
  // Source of set appointment
  source_of_set_appointment: 'sdr_booked_call' | 'non_sdr_booked_call' | '';
  // SDR-specific fields
  sdr_type: 'dialer' | 'dm_setter' | '';
  sdr_first_name: string;
  sdr_last_name: string;
  // Non-SDR specific fields
  non_sdr_source: 'vsl_booking' | 'regular_booking' | '';
  // SCRM outcome
  scrms_outcome: 'call_booked' | 'no_show' | 'no_close' | 'cancelled' | 'disqualified' | 'rescheduled' | 'payment_plan' | 'deposit' | 'closed_paid_in_full' | 'follow_up_call_scheduled';
  // Traffic source for CRM analytics
  traffic_source: 'organic' | 'meta';
  crm_stage: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'closed_won' | 'lost';
  // Existing fields
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  loss_reason_id: string;
  notes: string;
  call_duration: string;
  scheduled_at: string;
  completed_at: string;
}

function NewEnhancedCallContent() {
  const { user, isLoaded } = useAuth();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const router = useRouter();
  const { getTrafficSourceOptions, classifyTrafficSource } = useTrafficSourceClassification();
  
  const [formData, setFormData] = useState<EnhancedCallFormData>({
    client_id: '',
    prospect_first_name: '',
    prospect_last_name: '',
    prospect_email: '',
    prospect_phone: '',
    company_name: '',
    source_of_set_appointment: '',
    sdr_type: '',
    sdr_first_name: '',
    sdr_last_name: '',
    non_sdr_source: '',
    scrms_outcome: 'call_booked',
    traffic_source: 'organic',
    crm_stage: 'scheduled',
    call_type: 'outbound',
    status: 'completed',
    outcome: 'tbd',
    loss_reason_id: '',
    notes: '',
    call_duration: '',
    scheduled_at: '',
    completed_at: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { validate, getFieldError, hasFieldError, clearErrors } = useFormValidation(createCallSchema);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user?.publicMetadata?.agency_id) {
      setFormData(prev => ({
        ...prev,
        client_id: user.publicMetadata.agency_id,
        // Pre-select company name from workspace (you can customize this logic)
        company_name: user.publicMetadata.agency_name || 'Default Company'
      }));
    }
  }, [user, isLoaded, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-classify traffic source when source_of_set_appointment changes
      if (name === 'source_of_set_appointment' && value) {
        const classification = classifyTrafficSource({
          sourceOfAppointment: value as any,
          trafficSource: prev.traffic_source
        });
        
        // Only auto-set if traffic source is not manually set or is empty
        if (!prev.traffic_source || prev.traffic_source === '') {
          newData.traffic_source = classification.traffic_source;
        }
      }
      
      return newData;
    });
    
    // Clear field-specific error when user starts typing
    if (getFieldError(name)) {
      clearErrors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    clearErrors();

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
      // Clear conditional fields based on source selection
      sdr_type: formData.source_of_set_appointment === 'sdr_booked_call' ? formData.sdr_type : null,
      sdr_first_name: formData.source_of_set_appointment === 'sdr_booked_call' ? formData.sdr_first_name : null,
      sdr_last_name: formData.source_of_set_appointment === 'sdr_booked_call' ? formData.sdr_last_name : null,
      non_sdr_source: formData.source_of_set_appointment === 'non_sdr_booked_call' ? formData.non_sdr_source : null,
    };

    // Validate form data
    const validationResult = await validate(dataToValidate);
    
    if (!validationResult.isValid) {
      setLoading(false);
      return;
    }

    try {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      const response = await fetch(`/api/workspaces/${currentWorkspace.id}/calls`, {
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
      
      // Redirect to Kanban board after successful creation
      setTimeout(() => {
        router.push('/calls/kanban');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create call');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || workspaceLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">No Workspace Selected</h2>
          <p className="text-muted-foreground mb-6">Please select a workspace to log calls.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <FormContainer
            title="Call Logged Successfully!"
            subtitle="You will be redirected to the calls list shortly."
          >
            <div className="text-center">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <p className="text-muted-foreground">Your call has been logged successfully.</p>
            </div>
          </FormContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <FormContainer
          title="Log New Call - Enhanced SCRM"
          subtitle="Record comprehensive details of your sales call with SCRM tracking"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prospect Information Section */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-foreground mb-4">Prospect Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Prospect First Name"
                  name="prospect_first_name"
                  type="text"
                  value={formData.prospect_first_name}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_first_name')}
                  placeholder="Enter prospect first name"
                  required
                />

                <FormField
                  label="Prospect Last Name"
                  name="prospect_last_name"
                  type="text"
                  value={formData.prospect_last_name}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_last_name')}
                  placeholder="Enter prospect last name"
                  required
                />

                <FormField
                  label="Prospect Email"
                  name="prospect_email"
                  type="email"
                  value={formData.prospect_email}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_email')}
                  placeholder="Enter prospect email"
                  required
                />

                <FormField
                  label="Prospect Phone Number"
                  name="prospect_phone"
                  type="text"
                  value={formData.prospect_phone}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_phone')}
                  placeholder="Enter prospect phone number"
                  required
                />

                <FormField
                  label="Company Name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  error={getFieldError('company_name')}
                  placeholder="Company name"
                  required
                  disabled
                />
              </div>
            </div>

            {/* Source of Set Appointment Section */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-foreground mb-4">Source of Set Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Traffic Source"
                  name="traffic_source"
                  type="select"
                  value={formData.traffic_source}
                  onChange={handleInputChange}
                  error={getFieldError('traffic_source')}
                  required
                >
                  <option value="">Select traffic source</option>
                  {getTrafficSourceOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormField>
                <FormField
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
                </FormField>

                {/* SDR-specific fields */}
                {formData.source_of_set_appointment === 'sdr_booked_call' && (
                  <>
                    <FormField
                      label="SDR Type"
                      name="sdr_type"
                      type="select"
                      value={formData.sdr_type}
                      onChange={handleInputChange}
                      error={getFieldError('sdr_type')}
                      required
                    >
                      <option value="">Select SDR type</option>
                      <option value="dialer">Dialer</option>
                      <option value="dm_setter">DM Setter</option>
                    </FormField>

                    <FormField
                      label="SDR First Name"
                      name="sdr_first_name"
                      type="text"
                      value={formData.sdr_first_name}
                      onChange={handleInputChange}
                      error={getFieldError('sdr_first_name')}
                      placeholder="Enter SDR first name"
                      required
                    />

                    <FormField
                      label="SDR Last Name"
                      name="sdr_last_name"
                      type="text"
                      value={formData.sdr_last_name}
                      onChange={handleInputChange}
                      error={getFieldError('sdr_last_name')}
                      placeholder="Enter SDR last name"
                      required
                    />
                  </>
                )}

                {/* Non-SDR specific fields */}
                {formData.source_of_set_appointment === 'non_sdr_booked_call' && (
                  <FormField
                    label="Non-SDR Source"
                    name="non_sdr_source"
                    type="select"
                    value={formData.non_sdr_source}
                    onChange={handleInputChange}
                    error={getFieldError('non_sdr_source')}
                    required
                  >
                    <option value="">Select source</option>
                    <option value="vsl_booking">VSL Booking</option>
                    <option value="regular_booking">Regular Booking</option>
                  </FormField>
                )}
              </div>
            </div>

            {/* Call Details Section */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-foreground mb-4">Call Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
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
                </FormField>

                <FormField
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
                </FormField>

                <FormField
                  label="SCRM Outcome"
                  name="scrms_outcome"
                  type="select"
                  value={formData.scrms_outcome}
                  onChange={handleInputChange}
                  error={getFieldError('scrms_outcome')}
                  required
                >
                  <option value="call_booked">Call Booked</option>
                  <option value="no_show">No Show</option>
                  <option value="no_close">No Close</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disqualified">Disqualified</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="payment_plan">Payment Plan</option>
                  <option value="deposit">Deposit</option>
                  <option value="closed_paid_in_full">Closed/Paid in Full</option>
                  <option value="follow_up_call_scheduled">Follow Up Call Scheduled</option>
                </FormField>

                <FormField
                  label="CRM Stage"
                  name="crm_stage"
                  type="select"
                  value={formData.crm_stage}
                  onChange={handleInputChange}
                  error={getFieldError('crm_stage')}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="no_show">No Show</option>
                  <option value="closed_won">Closed/Won</option>
                  <option value="lost">Lost</option>
                </FormField>

                <FormField
                  label="Scheduled At"
                  name="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={handleInputChange}
                  error={getFieldError('scheduled_at')}
                  required
                />

                <FormField
                  label="Call Duration (minutes)"
                  name="call_duration"
                  type="number"
                  value={formData.call_duration}
                  onChange={handleInputChange}
                  error={getFieldError('call_duration')}
                  placeholder="Enter duration in minutes"
                />

                <FormField
                  label="Outcome"
                  name="outcome"
                  type="select"
                  value={formData.outcome}
                  onChange={handleInputChange}
                  error={getFieldError('outcome')}
                  required
                >
                  <option value="">Select outcome</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="tbd">To Be Determined</option>
                </FormField>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
              <FormField
                label="Notes"
                name="notes"
                type="textarea"
                value={formData.notes}
                onChange={handleInputChange}
                error={getFieldError('notes')}
                placeholder="Enter call notes and details"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700/50 p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <FormButton
                type="button"
                variant="secondary"
                onClick={() => router.push('/calls')}
                className="flex-1"
              >
                Cancel
              </FormButton>
              <FormButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                Log Call
              </FormButton>
            </div>
          </form>
        </FormContainer>
      </div>
    </div>
  );
}

export default function NewEnhancedCall() {
  return (
    <ModernDashboardLayout>
      <WorkspaceProvider>
        <NewEnhancedCallContent />
      </WorkspaceProvider>
    </ModernDashboardLayout>
  );
}
