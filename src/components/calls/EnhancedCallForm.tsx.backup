'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import FormContainer from '@/components/forms/FormContainer';
import FormField from '@/components/forms/FormField';
import FormButton from '@/components/forms/FormButton';
import { validateCreateEnhancedCall } from '@/lib/validation/enhancedCallSchemas';

interface EnhancedCallFormData {
  prospect_name: string;
  prospect_email: string;
  prospect_phone: string;
  company_name: string;
  source: 'sdr_call' | 'non_sdr_booked' | '';
  traffic_source: 'organic' | 'paid_ads' | '';
  call_type: 'inbound' | 'outbound' | '';
  status: 'completed' | 'no-show' | 'rescheduled' | '';
  outcome: 'won' | 'lost' | 'tbd' | '';
  enhanced_outcome: 'no_show' | 'no_close' | 'canceled' | 'disqualified' | 'rescheduled' | 'payment_plan_deposit' | 'close_paid_in_full' | 'follow_call_scheduled' | '';
  offer_pitched: string;
  setter_first_name: string;
  setter_last_name: string;
  cash_collected_upfront: string;
  total_amount_owed: string;
  payment_installments: string;
  payment_completion_status: 'pending' | 'in_progress' | 'completed' | '';
  crm_updated: boolean;
  prospect_notes: string;
  notes: string;
  call_duration: string;
  scheduled_at: string;
  completed_at: string;
  payment_schedule: PaymentScheduleItem[];
}

interface PaymentScheduleItem {
  installment_number: number;
  amount_due: string;
  due_date: string;
}

interface EnhancedCallFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EnhancedCallForm({ onSuccess, onCancel }: EnhancedCallFormProps) {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<EnhancedCallFormData>({
    prospect_name: '',
    prospect_email: '',
    prospect_phone: '',
    company_name: '',
    source: '',
    traffic_source: '',
    call_type: '',
    status: '',
    outcome: '',
    enhanced_outcome: '',
    offer_pitched: '',
    setter_first_name: '',
    setter_last_name: '',
    cash_collected_upfront: '',
    total_amount_owed: '',
    payment_installments: '1',
    payment_completion_status: 'pending',
    crm_updated: false,
    prospect_notes: '',
    notes: '',
    call_duration: '',
    scheduled_at: '',
    completed_at: '',
    payment_schedule: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [setters, setSetters] = useState<any[]>([]);
  
  const { validate, getFieldError, hasFieldError, clearErrors } = useFormValidation();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    } else if (user) {
      // Load offers and setters
      loadOffersAndSetters();
    }
  }, [user, isLoaded, router]);

  const loadOffersAndSetters = async () => {
    try {
      const [offersResponse, settersResponse] = await Promise.all([
        fetch('/api/offers'),
        fetch('/api/setters')
      ]);

      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        setOffers(offersData.data || []);
      }

      if (settersResponse.ok) {
        const settersData = await settersResponse.json();
        setSetters(settersData.data || []);
      }
    } catch (error) {
      console.error('Failed to load offers and setters:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear field-specific error when user starts typing
    if (getFieldError(name)) {
      clearErrors();
    }
  };

  const addPaymentScheduleItem = () => {
    const nextInstallment = formData.payment_schedule.length + 1;
    setFormData(prev => ({
      ...prev,
      payment_schedule: [
        ...prev.payment_schedule,
        {
          installment_number: nextInstallment,
          amount_due: '',
          due_date: ''
        }
      ]
    }));
  };

  const removePaymentScheduleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      payment_schedule: prev.payment_schedule.filter((_, i) => i !== index)
    }));
  };

  const updatePaymentScheduleItem = (index: number, field: keyof PaymentScheduleItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      payment_schedule: prev.payment_schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
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
      company_name: formData.company_name || null,
      source: formData.source || null,
      traffic_source: formData.traffic_source || null,
      enhanced_outcome: formData.enhanced_outcome || null,
      offer_pitched: formData.offer_pitched || null,
      setter_first_name: formData.setter_first_name || null,
      setter_last_name: formData.setter_last_name || null,
      cash_collected_upfront: formData.cash_collected_upfront ? parseFloat(formData.cash_collected_upfront) : null,
      total_amount_owed: formData.total_amount_owed ? parseFloat(formData.total_amount_owed) : null,
      payment_installments: formData.payment_installments ? parseInt(formData.payment_installments) : null,
      payment_completion_status: formData.payment_completion_status || null,
      prospect_notes: formData.prospect_notes || null,
      notes: formData.notes || null,
      call_duration: formData.call_duration ? parseInt(formData.call_duration) : null,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at) : null,
      completed_at: formData.completed_at ? new Date(formData.completed_at) : null,
      payment_schedule: formData.payment_schedule.map(item => ({
        installment_number: item.installment_number,
        amount_due: parseFloat(item.amount_due),
        due_date: new Date(item.due_date)
      }))
    };

    // Validate form data
    const validationResult = await validateCreateEnhancedCall(dataToValidate);
    
    if (!validationResult.isValid) {
      setError('Please fix the validation errors below');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/calls/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToValidate),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create enhanced call');
      }

      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to calls list after successful creation
        setTimeout(() => {
          router.push('/calls');
        }, 2000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create enhanced call');
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
              <p className="text-gray-600">Your enhanced call has been logged successfully.</p>
            </div>
          </FormContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Call Logging</h1>
          <p className="text-lg text-gray-600">Record comprehensive details of your sales call with precision</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Prospect Information */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/20">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Prospect Information</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  label="Prospect Name *"
                  name="prospect_name"
                  type="text"
                  value={formData.prospect_name}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_name')}
                  placeholder="Enter prospect name"
                  required
                />

                <FormField
                  label="Company Name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  error={getFieldError('company_name')}
                  placeholder="Enter company name"
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

                <FormField
                  label="Prospect Phone"
                  name="prospect_phone"
                  type="text"
                  value={formData.prospect_phone}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_phone')}
                  placeholder="Enter prospect phone"
                />
              </div>
            </div>

            {/* Call Details */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/20">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Call Details</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  label="Source *"
                  name="source"
                  type="select"
                  value={formData.source}
                  onChange={handleInputChange}
                  error={getFieldError('source')}
                  required
                >
                  <option value="">Select source</option>
                  <option value="sdr_call">SDR Call</option>
                  <option value="non_sdr_booked">Non-SDR Booked Call</option>
                </FormField>

                <FormField
                  label="Traffic Source *"
                  name="traffic_source"
                  type="select"
                  value={formData.traffic_source}
                  onChange={handleInputChange}
                  error={getFieldError('traffic_source')}
                  required
                >
                  <option value="">Select traffic source</option>
                  <option value="organic">Organic</option>
                  <option value="paid_ads">Paid Ads</option>
                </FormField>

                <FormField
                  label="Call Type *"
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
                  label="Status *"
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
                  label="Outcome *"
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

                <FormField
                  label="Enhanced Outcome"
                  name="enhanced_outcome"
                  type="select"
                  value={formData.enhanced_outcome}
                  onChange={handleInputChange}
                  error={getFieldError('enhanced_outcome')}
                >
                  <option value="">Select enhanced outcome</option>
                  <option value="no_show">No Show</option>
                  <option value="no_close">No Close</option>
                  <option value="canceled">Canceled</option>
                  <option value="disqualified">Disqualified</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="payment_plan_deposit">Payment Plan Deposit</option>
                  <option value="close_paid_in_full">Close Paid in Full</option>
                  <option value="follow_call_scheduled">Follow Call Scheduled</option>
                </FormField>
              </div>
            </div>

            {/* Team Information - Only show for SDR calls */}
            {formData.source === 'sdr_call' && (
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/20">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Setter Information</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    label="Setter First Name"
                    name="setter_first_name"
                    type="text"
                    value={formData.setter_first_name}
                    onChange={handleInputChange}
                    error={getFieldError('setter_first_name')}
                    placeholder="Enter setter first name"
                  />

                  <FormField
                    label="Setter Last Name"
                    name="setter_last_name"
                    type="text"
                    value={formData.setter_last_name}
                    onChange={handleInputChange}
                    error={getFieldError('setter_last_name')}
                    placeholder="Enter setter last name"
                  />
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/20">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Payment Information</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <FormField
                  label="Cash Collected Upfront"
                  name="cash_collected_upfront"
                  type="number"
                  step="0.01"
                  value={formData.cash_collected_upfront}
                  onChange={handleInputChange}
                  error={getFieldError('cash_collected_upfront')}
                  placeholder="0.00"
                />

                <FormField
                  label="Total Amount Owed"
                  name="total_amount_owed"
                  type="number"
                  step="0.01"
                  value={formData.total_amount_owed}
                  onChange={handleInputChange}
                  error={getFieldError('total_amount_owed')}
                  placeholder="0.00"
                />

                <FormField
                  label="Payment Installments"
                  name="payment_installments"
                  type="number"
                  value={formData.payment_installments}
                  onChange={handleInputChange}
                  error={getFieldError('payment_installments')}
                  placeholder="1"
                />
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-semibold text-gray-900">
                    Payment Schedule
                  </label>
                  <button
                    type="button"
                    onClick={addPaymentScheduleItem}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Installment
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.payment_schedule.map((item, index) => (
                    <div key={index} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3">
                            <span className="text-white text-sm font-semibold">{item.installment_number}</span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900">Installment {item.installment_number}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePaymentScheduleItem(index)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.amount_due}
                            onChange={(e) => updatePaymentScheduleItem(index, 'amount_due', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                          <input
                            type="date"
                            value={item.due_date}
                            onChange={(e) => updatePaymentScheduleItem(index, 'due_date', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.payment_schedule.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No payment schedule</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding a payment installment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/20">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
              </div>
              <div className="space-y-6">
                <FormField
                  label="Offer Pitched"
                  name="offer_pitched"
                  type="textarea"
                  value={formData.offer_pitched}
                  onChange={handleInputChange}
                  error={getFieldError('offer_pitched')}
                  placeholder="Describe the offer pitched during the call"
                />

                <FormField
                  label="Prospect Notes"
                  name="prospect_notes"
                  type="textarea"
                  value={formData.prospect_notes}
                  onChange={handleInputChange}
                  error={getFieldError('prospect_notes')}
                  placeholder="Additional notes about the prospect"
                />

                <FormField
                  label="Call Notes"
                  name="notes"
                  type="textarea"
                  value={formData.notes}
                  onChange={handleInputChange}
                  error={getFieldError('notes')}
                  placeholder="General call notes and details"
                />

                <div className="flex items-center p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                  <input
                    type="checkbox"
                    name="crm_updated"
                    checked={formData.crm_updated}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded-lg transition-colors"
                  />
                  <label className="ml-3 block text-sm font-medium text-gray-900">
                    CRM Updated
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={onCancel || (() => router.push('/calls'))}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging Call...
                  </div>
                ) : (
                  'Log Enhanced Call'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
