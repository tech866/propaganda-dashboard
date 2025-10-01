import * as yup from 'yup';

// Enhanced call validation schema
export const createEnhancedCallSchema = yup.object().shape({
  client_id: yup.string().uuid().required('Client ID is required'),
  prospect_name: yup.string().required('Prospect name is required').min(1, 'Prospect name cannot be empty'),
  prospect_email: yup.string().email('Invalid email format').nullable(),
  prospect_phone: yup.string().nullable(),
  company_name: yup.string().nullable(),
  closer_first_name: yup.string().nullable(),
  closer_last_name: yup.string().nullable(),
  source: yup.string().oneOf(['sdr_call', 'non_sdr_booked'], 'Invalid source').nullable(),
  traffic_source: yup.string().oneOf(['organic', 'paid_ads'], 'Invalid traffic source').nullable(),
  call_type: yup.string().oneOf(['inbound', 'outbound'], 'Invalid call type').required('Call type is required'),
  status: yup.string().oneOf(['completed', 'no-show', 'rescheduled'], 'Invalid status').required('Status is required'),
  outcome: yup.string().oneOf(['won', 'lost', 'tbd'], 'Invalid outcome').required('Outcome is required'),
  enhanced_outcome: yup.string().oneOf([
    'no_show', 'no_close', 'canceled', 'disqualified', 'rescheduled', 
    'payment_plan_deposit', 'close_paid_in_full', 'follow_call_scheduled'
  ], 'Invalid enhanced outcome').nullable(),
  loss_reason_id: yup.string().uuid().nullable(),
  offer_pitched: yup.string().nullable(),
  setter_first_name: yup.string().nullable(),
  setter_last_name: yup.string().nullable(),
  cash_collected_upfront: yup.number().min(0, 'Cash collected cannot be negative').nullable(),
  total_amount_owed: yup.number().min(0, 'Total amount owed cannot be negative').nullable(),
  payment_installments: yup.number().integer().min(1, 'Payment installments must be at least 1').nullable(),
  payment_completion_status: yup.string().oneOf(['pending', 'in_progress', 'completed'], 'Invalid payment status').nullable(),
  crm_updated: yup.boolean().nullable(),
  prospect_notes: yup.string().nullable(),
  notes: yup.string().nullable(),
  call_duration: yup.number().integer().min(0, 'Call duration cannot be negative').nullable(),
  scheduled_at: yup.date().nullable(),
  completed_at: yup.date().nullable(),
  payment_schedule: yup.array().of(
    yup.object().shape({
      installment_number: yup.number().integer().min(1, 'Installment number must be at least 1').required(),
      amount_due: yup.number().min(0, 'Amount due cannot be negative').required(),
      due_date: yup.date().required('Due date is required'),
    })
  ).nullable(),
});

// Ad spend validation schema
export const createAdSpendSchema = yup.object().shape({
  client_id: yup.string().uuid().required('Client ID is required'),
  campaign_name: yup.string().nullable(),
  platform: yup.string().oneOf(['meta', 'google', 'other'], 'Invalid platform').required('Platform is required'),
  spend_amount: yup.number().min(0, 'Spend amount cannot be negative').required('Spend amount is required'),
  date_from: yup.date().required('Start date is required'),
  date_to: yup.date().required('End date is required').min(yup.ref('date_from'), 'End date must be after start date'),
  clicks: yup.number().integer().min(0, 'Clicks cannot be negative').nullable(),
  impressions: yup.number().integer().min(0, 'Impressions cannot be negative').nullable(),
  source: yup.string().oneOf(['manual', 'api'], 'Invalid source').default('manual'),
  meta_campaign_id: yup.string().nullable(),
});

// Payment schedule validation schema
export const paymentScheduleSchema = yup.object().shape({
  installment_number: yup.number().integer().min(1, 'Installment number must be at least 1').required(),
  amount_due: yup.number().min(0, 'Amount due cannot be negative').required(),
  due_date: yup.date().required('Due date is required'),
});

// Analytics filter validation schema
export const analyticsFilterSchema = yup.object().shape({
  clientId: yup.string().uuid().nullable(),
  userId: yup.string().uuid().nullable(),
  dateFrom: yup.date().nullable(),
  dateTo: yup.date().nullable().min(yup.ref('dateFrom'), 'End date must be after start date'),
  trafficSource: yup.string().oneOf(['organic', 'paid_ads'], 'Invalid traffic source').nullable(),
  enhancedOutcome: yup.string().nullable(),
});

// Call filter validation schema
export const enhancedCallFilterSchema = yup.object().shape({
  clientId: yup.string().uuid().nullable(),
  userId: yup.string().uuid().nullable(),
  dateFrom: yup.date().nullable(),
  dateTo: yup.date().nullable().min(yup.ref('dateFrom'), 'End date must be after start date'),
  trafficSource: yup.string().oneOf(['organic', 'paid_ads'], 'Invalid traffic source').nullable(),
  enhancedOutcome: yup.string().nullable(),
  limit: yup.number().integer().min(1, 'Limit must be at least 1').max(1000, 'Limit cannot exceed 1000').default(100),
  offset: yup.number().integer().min(0, 'Offset cannot be negative').default(0),
});

// Validation helper functions
export const validateCreateEnhancedCall = async (data: any) => {
  try {
    const validatedData = await createEnhancedCallSchema.validate(data, { abortEarly: false });
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return { isValid: false, data: null, errors };
    }
    return { isValid: false, data: null, errors: [{ field: 'general', message: 'Validation failed' }] };
  }
};

export const validateCreateAdSpend = async (data: any) => {
  try {
    const validatedData = await createAdSpendSchema.validate(data, { abortEarly: false });
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return { isValid: false, data: null, errors };
    }
    return { isValid: false, data: null, errors: [{ field: 'general', message: 'Validation failed' }] };
  }
};

export const validateAnalyticsFilter = async (data: any) => {
  try {
    const validatedData = await analyticsFilterSchema.validate(data, { abortEarly: false });
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return { isValid: false, data: null, errors };
    }
    return { isValid: false, data: null, errors: [{ field: 'general', message: 'Validation failed' }] };
  }
};

export const validateEnhancedCallFilter = async (data: any) => {
  try {
    const validatedData = await enhancedCallFilterSchema.validate(data, { abortEarly: false });
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return { isValid: false, data: null, errors };
    }
    return { isValid: false, data: null, errors: [{ field: 'general', message: 'Validation failed' }] };
  }
};

// Helper function to validate payment schedule
export const validatePaymentSchedule = async (data: any[]) => {
  try {
    const validatedData = await yup.array().of(paymentScheduleSchema).validate(data, { abortEarly: false });
    return { isValid: true, data: validatedData, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map(err => ({
        field: err.path,
        message: err.message,
      }));
      return { isValid: false, data: null, errors };
    }
    return { isValid: false, data: null, errors: [{ field: 'general', message: 'Validation failed' }] };
  }
};
