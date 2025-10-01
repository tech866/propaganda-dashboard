import * as yup from 'yup';

// UUID regex for validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Enhanced Call Logging Form Schema
export const enhancedCallLoggingSchema = yup.object().shape({
  // Basic call information
  client_id: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').required('Client ID is required'),
  prospect_name: yup.string().min(2, 'Prospect name must be at least 2 characters').required('Prospect name is required'),
  prospect_email: yup.string().email('Invalid email format').optional().nullable(),
  prospect_phone: yup.string().optional().nullable(),
  call_type: yup.string().oneOf(['inbound', 'outbound'], 'Call type must be either inbound or outbound').required('Call type is required'),
  status: yup.string().oneOf(['completed', 'no-show', 'rescheduled'], 'Status must be completed, no-show, or rescheduled').required('Status is required'),
  outcome: yup.string().oneOf(['won', 'lost', 'tbd'], 'Outcome must be won, lost, or tbd').default('tbd'),
  loss_reason_id: yup.string().matches(uuidRegex, 'Loss Reason ID must be a valid UUID').optional().nullable(),
  notes: yup.string().optional().nullable(),
  call_duration: yup.number().integer('Call duration must be an integer').min(0, 'Call duration cannot be negative').optional().nullable(),
  scheduled_at: yup.date().optional().nullable(),
  completed_at: yup.date().optional().nullable(),
  
  // Enhanced fields with specific validation rules
  closer_first_name: yup.string().min(1, 'Closer first name is required').required('Closer first name is required'),
  closer_last_name: yup.string().min(1, 'Closer last name is required').required('Closer last name is required'),
  
  source_of_set_appointment: yup.string()
    .oneOf(['sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking'], 'Invalid source of set appointment')
    .required('Source of set appointment is required'),
  
  enhanced_call_outcome: yup.string()
    .oneOf(['no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'], 'Invalid enhanced call outcome')
    .required('Call outcome is required'),
  
  initial_payment_collected_on: yup.date()
    .max(new Date(), 'Payment date cannot be in the future')
    .optional()
    .nullable()
    .test('payment-date-logic', 'Payment date is required when outcome is deposit or closed_paid_in_full', function(value) {
      const outcome = this.parent.enhanced_call_outcome;
      if ((outcome === 'deposit' || outcome === 'closed_paid_in_full') && !value) {
        return this.createError({ message: 'Payment date is required for deposit or closed deals' });
      }
      return true;
    }),
  
  customer_full_name: yup.string()
    .min(2, 'Customer full name must be at least 2 characters')
    .optional()
    .nullable()
    .test('customer-name-logic', 'Customer name is required when outcome is deposit or closed_paid_in_full', function(value) {
      const outcome = this.parent.enhanced_call_outcome;
      if ((outcome === 'deposit' || outcome === 'closed_paid_in_full') && !value) {
        return this.createError({ message: 'Customer name is required for deposit or closed deals' });
      }
      return true;
    }),
  
  customer_email: yup.string()
    .email('Invalid customer email format')
    .optional()
    .nullable()
    .test('customer-email-logic', 'Customer email is required when outcome is deposit or closed_paid_in_full', function(value) {
      const outcome = this.parent.enhanced_call_outcome;
      if ((outcome === 'deposit' || outcome === 'closed_paid_in_full') && !value) {
        return this.createError({ message: 'Customer email is required for deposit or closed deals' });
      }
      return true;
    }),
  
  calls_taken: yup.number()
    .integer('Calls taken must be an integer')
    .min(1, 'Calls taken must be at least 1')
    .max(100, 'Calls taken cannot exceed 100')
    .default(1),
  
  setter_first_name: yup.string()
    .min(1, 'Setter first name is required')
    .required('Setter first name is required'),
  
  setter_last_name: yup.string()
    .min(1, 'Setter last name is required')
    .required('Setter last name is required'),
  
  cash_collected_upfront: yup.number()
    .min(0, 'Cash collected upfront cannot be negative')
    .max(1000000, 'Cash collected upfront cannot exceed $1,000,000')
    .optional()
    .nullable()
    .test('cash-logic', 'Cash collected is required when outcome is deposit or closed_paid_in_full', function(value) {
      const outcome = this.parent.enhanced_call_outcome;
      if ((outcome === 'deposit' || outcome === 'closed_paid_in_full') && (!value || value === 0)) {
        return this.createError({ message: 'Cash collected is required for deposit or closed deals' });
      }
      return true;
    }),
  
  total_amount_owed: yup.number()
    .min(0, 'Total amount owed cannot be negative')
    .max(1000000, 'Total amount owed cannot exceed $1,000,000')
    .optional()
    .nullable()
    .test('total-amount-logic', 'Total amount is required when outcome is deposit or closed_paid_in_full', function(value) {
      const outcome = this.parent.enhanced_call_outcome;
      if ((outcome === 'deposit' || outcome === 'closed_paid_in_full') && (!value || value === 0)) {
        return this.createError({ message: 'Total amount is required for deposit or closed deals' });
      }
      return true;
    })
    .test('amount-consistency', 'Total amount must be greater than or equal to cash collected upfront', function(value) {
      const cashCollected = this.parent.cash_collected_upfront;
      if (value && cashCollected && value < cashCollected) {
        return this.createError({ message: 'Total amount cannot be less than cash collected upfront' });
      }
      return true;
    }),
  
  prospect_notes: yup.string()
    .max(2000, 'Prospect notes cannot exceed 2000 characters')
    .optional()
    .nullable(),
  
  lead_source: yup.string()
    .oneOf(['organic', 'ads'], 'Lead source must be either organic or ads')
    .required('Lead source is required'),
});

// Field-specific validation schemas for real-time validation
export const fieldValidationSchemas = {
  prospect_name: yup.string().min(2, 'Prospect name must be at least 2 characters').required('Prospect name is required'),
  prospect_email: yup.string().email('Invalid email format').optional().nullable(),
  prospect_phone: yup.string().optional().nullable(),
  call_duration: yup.number().integer('Call duration must be an integer').min(0, 'Call duration cannot be negative').optional().nullable(),
  closer_first_name: yup.string().min(1, 'Closer first name is required').required('Closer first name is required'),
  closer_last_name: yup.string().min(1, 'Closer last name is required').required('Closer last name is required'),
  customer_full_name: yup.string().min(2, 'Customer full name must be at least 2 characters').optional().nullable(),
  customer_email: yup.string().email('Invalid customer email format').optional().nullable(),
  calls_taken: yup.number().integer('Calls taken must be an integer').min(1, 'Calls taken must be at least 1').max(100, 'Calls taken cannot exceed 100'),
  setter_first_name: yup.string().min(1, 'Setter first name is required').required('Setter first name is required'),
  setter_last_name: yup.string().min(1, 'Setter last name is required').required('Setter last name is required'),
  cash_collected_upfront: yup.number().min(0, 'Cash collected upfront cannot be negative').max(1000000, 'Cash collected upfront cannot exceed $1,000,000').optional().nullable(),
  total_amount_owed: yup.number().min(0, 'Total amount owed cannot be negative').max(1000000, 'Total amount owed cannot exceed $1,000,000').optional().nullable(),
  prospect_notes: yup.string().max(2000, 'Prospect notes cannot exceed 2000 characters').optional().nullable(),
};

// Validation helper functions
export const validateEnhancedCallField = async (fieldName: string, value: any, formData?: any): Promise<string | null> => {
  try {
    if (fieldValidationSchemas[fieldName as keyof typeof fieldValidationSchemas]) {
      await fieldValidationSchemas[fieldName as keyof typeof fieldValidationSchemas].validate(value);
    }
    
    // Additional cross-field validation
    if (fieldName === 'total_amount_owed' && formData?.cash_collected_upfront) {
      if (value && formData.cash_collected_upfront && value < formData.cash_collected_upfront) {
        return 'Total amount cannot be less than cash collected upfront';
      }
    }
    
    if (fieldName === 'cash_collected_upfront' && formData?.total_amount_owed) {
      if (value && formData.total_amount_owed && value > formData.total_amount_owed) {
        return 'Cash collected upfront cannot be greater than total amount owed';
      }
    }
    
    return null;
  } catch (error: any) {
    return error.message;
  }
};

// Business logic validation
export const validateBusinessLogic = (formData: any): string[] => {
  const errors: string[] = [];
  
  // Payment logic validation
  if (formData.enhanced_call_outcome === 'deposit' || formData.enhanced_call_outcome === 'closed_paid_in_full') {
    if (!formData.initial_payment_collected_on) {
      errors.push('Payment date is required for deposit or closed deals');
    }
    if (!formData.customer_full_name) {
      errors.push('Customer name is required for deposit or closed deals');
    }
    if (!formData.customer_email) {
      errors.push('Customer email is required for deposit or closed deals');
    }
    if (!formData.cash_collected_upfront || formData.cash_collected_upfront === 0) {
      errors.push('Cash collected is required for deposit or closed deals');
    }
    if (!formData.total_amount_owed || formData.total_amount_owed === 0) {
      errors.push('Total amount is required for deposit or closed deals');
    }
  }
  
  // Amount consistency validation
  if (formData.cash_collected_upfront && formData.total_amount_owed) {
    if (formData.cash_collected_upfront > formData.total_amount_owed) {
      errors.push('Cash collected upfront cannot be greater than total amount owed');
    }
  }
  
  // Date validation
  if (formData.initial_payment_collected_on && new Date(formData.initial_payment_collected_on) > new Date()) {
    errors.push('Payment date cannot be in the future');
  }
  
  if (formData.scheduled_at && formData.completed_at) {
    if (new Date(formData.completed_at) < new Date(formData.scheduled_at)) {
      errors.push('Completed date cannot be before scheduled date');
    }
  }
  
  return errors;
};

// Additional validation schemas for API routes
export const validateCreateEnhancedCall = (data: any) => enhancedCallLoggingSchema.validate(data, { abortEarly: false });
export const validateEnhancedCallFilter = (data: any) => {
  const filterSchema = yup.object().shape({
    clientId: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').optional(),
    userId: yup.string().matches(uuidRegex, 'User ID must be a valid UUID').optional(),
    dateFrom: yup.date().optional(),
    dateTo: yup.date().optional(),
    outcome: yup.string().optional(),
    leadSource: yup.string().oneOf(['organic', 'ads']).optional(),
    limit: yup.number().integer().min(1).max(100).default(10),
    offset: yup.number().integer().min(0).default(0),
  });
  return filterSchema.validate(data, { abortEarly: false });
};

export const validateAnalyticsFilter = (data: any) => {
  const analyticsSchema = yup.object().shape({
    clientId: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').optional(),
    userId: yup.string().matches(uuidRegex, 'User ID must be a valid UUID').optional(),
    dateFrom: yup.date().optional(),
    dateTo: yup.date().optional(),
    groupBy: yup.string().oneOf(['day', 'week', 'month', 'year']).default('month'),
  });
  return analyticsSchema.validate(data, { abortEarly: false });
};

export const validateCreateAdSpend = (data: any) => {
  const adSpendSchema = yup.object().shape({
    client_id: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').required(),
    platform: yup.string().oneOf(['facebook', 'instagram', 'google', 'tiktok']).required(),
    campaign_name: yup.string().min(1, 'Campaign name is required').required(),
    amount: yup.number().min(0, 'Amount cannot be negative').required(),
    date: yup.date().max(new Date(), 'Date cannot be in the future').required(),
    currency: yup.string().oneOf(['USD', 'EUR', 'GBP']).default('USD'),
  });
  return adSpendSchema.validate(data, { abortEarly: false });
};

// Export validation functions
export const validateEnhancedCallLogging = (data: any) => enhancedCallLoggingSchema.validate(data, { abortEarly: false });
export const validateEnhancedCallLoggingSync = (data: any) => enhancedCallLoggingSchema.validateSync(data, { abortEarly: false });