'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { createCallSchema } from '@/lib/validation/clientSchemas';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';

interface CallFormData {
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
}

export default function NewCall() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CallFormData>({
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
        client_id: user.publicMetadata.agency_id
      }));
    }
  }, [user, isLoaded, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    };

    // Validate form data
    const validationResult = await validate(dataToValidate);
    
    if (!validationResult.isValid) {
      setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <FormContainer
            title="Call Logged Successfully!"
            subtitle="You will be redirected to the calls list shortly."
          >
            <div className="text-center">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <p className="text-gray-600">Your call has been logged successfully.</p>
            </div>
          </FormContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <FormContainer
          title="Log New Call"
          subtitle="Record details of your sales call"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Prospect Name"
                name="prospect_name"
                type="text"
                value={formData.prospect_name}
                onChange={handleInputChange}
                error={getFieldError('prospect_name')}
                placeholder="Enter prospect name"
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Prospect Phone"
                name="prospect_phone"
                type="text"
                value={formData.prospect_phone}
                onChange={handleInputChange}
                error={getFieldError('prospect_phone')}
                placeholder="Enter prospect phone"
              />

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                label="Scheduled At"
                name="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={handleInputChange}
                error={getFieldError('scheduled_at')}
              />
            </div>

            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleInputChange}
              error={getFieldError('notes')}
              placeholder="Enter call notes and details"
            />

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
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
