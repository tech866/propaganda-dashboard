import * as yup from 'yup';

// UUID regex for validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Login Schema
export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

// Register Schema
export const registerSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  clientId: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').required('Client ID is required'),
});

// Create Call Schema - Enhanced for SCRM Requirements
export const createCallSchema = yup.object().shape({
  client_id: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').required('Client ID is required'),
  
  // Split prospect name into first and last name
  prospect_first_name: yup.string().min(2, 'Prospect first name must be at least 2 characters').required('Prospect first name is required'),
  prospect_last_name: yup.string().min(2, 'Prospect last name must be at least 2 characters').required('Prospect last name is required'),
  
  // Keep legacy prospect_name for backward compatibility
  prospect_name: yup.string().min(2, 'Prospect name must be at least 2 characters').optional().nullable(),
  
  prospect_email: yup.string().email('Invalid email format').required('Prospect email is required'),
  prospect_phone: yup.string().required('Prospect phone number is required'),
  
  // Company name (pre-selected from workspace)
  company_name: yup.string().required('Company name is required'),
  
  // Source of set appointment with conditional logic
  source_of_set_appointment: yup.string().oneOf(['sdr_booked_call', 'non_sdr_booked_call'], 'Source must be either SDR booked call or non SDR booked call').required('Source of set appointment is required'),
  
  // SDR-specific fields (conditional)
  sdr_type: yup.string().oneOf(['dialer', 'dm_setter'], 'SDR type must be either dialer or DM setter').when('source_of_set_appointment', {
    is: 'sdr_booked_call',
    then: (schema) => schema.required('SDR type is required for SDR booked calls'),
    otherwise: (schema) => schema.optional().nullable()
  }),
  sdr_first_name: yup.string().when('source_of_set_appointment', {
    is: 'sdr_booked_call',
    then: (schema) => schema.required('SDR first name is required for SDR booked calls'),
    otherwise: (schema) => schema.optional().nullable()
  }),
  sdr_last_name: yup.string().when('source_of_set_appointment', {
    is: 'sdr_booked_call',
    then: (schema) => schema.required('SDR last name is required for SDR booked calls'),
    otherwise: (schema) => schema.optional().nullable()
  }),
  
  // Non-SDR specific fields (conditional)
  non_sdr_source: yup.string().oneOf(['vsl_booking', 'regular_booking'], 'Non-SDR source must be either VSL booking or regular booking').when('source_of_set_appointment', {
    is: 'non_sdr_booked_call',
    then: (schema) => schema.required('Non-SDR source is required for non SDR booked calls'),
    otherwise: (schema) => schema.optional().nullable()
  }),
  
  // SCRM outcome stages
  scrms_outcome: yup.string().oneOf([
    'call_booked', 'no_show', 'no_close', 'cancelled', 'disqualified', 
    'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'
  ], 'Invalid SCRM outcome').default('call_booked'),
  
  // Traffic source and CRM stage
  traffic_source: yup.string().oneOf(['organic', 'meta'], 'Traffic source must be either organic or meta').required('Traffic source is required'),
  crm_stage: yup.string().oneOf(['scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'], 'Invalid CRM stage').default('scheduled'),
  
  // Existing fields
  call_type: yup.string().oneOf(['inbound', 'outbound'], 'Call type must be either inbound or outbound').required('Call type is required'),
  status: yup.string().oneOf(['completed', 'no-show', 'rescheduled'], 'Status must be completed, no-show, or rescheduled').required('Status is required'),
  outcome: yup.string().oneOf(['won', 'lost', 'tbd'], 'Outcome must be won, lost, or tbd').default('tbd'),
  loss_reason_id: yup.string().matches(uuidRegex, 'Loss Reason ID must be a valid UUID').optional().nullable(),
  notes: yup.string().optional().nullable(),
  call_duration: yup.number().integer('Call duration must be an integer').min(0, 'Call duration cannot be negative').optional().nullable(),
  scheduled_at: yup.date().required('Scheduled at is required'),
  completed_at: yup.date().optional().nullable(),
  
  // Legacy enhanced call logging form fields (keep for backward compatibility)
  closer_first_name: yup.string().optional().nullable(),
  closer_last_name: yup.string().optional().nullable(),
  source_of_set_appointment_legacy: yup.string().oneOf(['sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking'], 'Invalid source of set appointment').optional().nullable(),
  enhanced_call_outcome: yup.string().oneOf(['no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'], 'Invalid enhanced call outcome').optional().nullable(),
  initial_payment_collected_on: yup.date().optional().nullable(),
  customer_full_name: yup.string().optional().nullable(),
  customer_email: yup.string().email('Invalid customer email format').optional().nullable(),
  calls_taken: yup.number().integer('Calls taken must be an integer').min(1, 'Calls taken must be at least 1').optional().nullable(),
  setter_first_name: yup.string().optional().nullable(),
  setter_last_name: yup.string().optional().nullable(),
  cash_collected_upfront: yup.number().min(0, 'Cash collected upfront cannot be negative').optional().nullable(),
  total_amount_owed: yup.number().min(0, 'Total amount owed cannot be negative').optional().nullable(),
  prospect_notes: yup.string().optional().nullable(),
  lead_source: yup.string().oneOf(['organic', 'ads'], 'Lead source must be either organic or ads').optional().nullable(),
});

// Update Call Schema (all fields optional)
export const updateCallSchema = yup.object().shape({
  prospect_name: yup.string().min(2, 'Prospect name must be at least 2 characters').optional(),
  prospect_email: yup.string().email('Invalid email format').optional().nullable(),
  prospect_phone: yup.string().optional().nullable(),
  call_type: yup.string().oneOf(['inbound', 'outbound'], 'Call type must be either inbound or outbound').optional(),
  status: yup.string().oneOf(['completed', 'no-show', 'rescheduled'], 'Status must be completed, no-show, or rescheduled').optional(),
  outcome: yup.string().oneOf(['won', 'lost', 'tbd'], 'Outcome must be won, lost, or tbd').optional(),
  loss_reason_id: yup.string().matches(uuidRegex, 'Loss Reason ID must be a valid UUID').optional().nullable(),
  notes: yup.string().optional().nullable(),
  call_duration: yup.number().integer('Call duration must be an integer').min(0, 'Call duration cannot be negative').optional().nullable(),
  scheduled_at: yup.date().optional().nullable(),
  completed_at: yup.date().optional().nullable(),
  // Enhanced call logging form fields
  closer_first_name: yup.string().optional().nullable(),
  closer_last_name: yup.string().optional().nullable(),
  source_of_set_appointment: yup.string().oneOf(['sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking'], 'Invalid source of set appointment').optional().nullable(),
  enhanced_call_outcome: yup.string().oneOf(['no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'], 'Invalid enhanced call outcome').optional().nullable(),
  initial_payment_collected_on: yup.date().optional().nullable(),
  customer_full_name: yup.string().optional().nullable(),
  customer_email: yup.string().email('Invalid customer email format').optional().nullable(),
  calls_taken: yup.number().integer('Calls taken must be an integer').min(1, 'Calls taken must be at least 1').optional().nullable(),
  setter_first_name: yup.string().optional().nullable(),
  setter_last_name: yup.string().optional().nullable(),
  cash_collected_upfront: yup.number().min(0, 'Cash collected upfront cannot be negative').optional().nullable(),
  total_amount_owed: yup.number().min(0, 'Total amount owed cannot be negative').optional().nullable(),
  prospect_notes: yup.string().optional().nullable(),
  lead_source: yup.string().oneOf(['organic', 'ads'], 'Lead source must be either organic or ads').optional().nullable(),
  // Traffic source and CRM stage
  traffic_source: yup.string().oneOf(['organic', 'meta'], 'Traffic source must be either organic or meta').optional().nullable(),
  crm_stage: yup.string().oneOf(['scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'], 'Invalid CRM stage').optional().nullable(),
});

// Create User Schema (for admin panel)
export const createUserSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  role: yup.string().oneOf(['sales', 'admin', 'ceo'], 'Invalid role. Must be one of: sales, admin, ceo').required('Role is required'),
  clientId: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').required('Client ID is required'),
});

// Call Filter Schema
export const callFilterSchema = yup.object().shape({
  clientId: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').optional(),
  userId: yup.string().matches(uuidRegex, 'User ID must be a valid UUID').optional(),
  dateFrom: yup.date().optional(),
  dateTo: yup.date().optional(),
  limit: yup.number().integer('Limit must be an integer').min(1, 'Limit must be at least 1').optional(),
  offset: yup.number().integer('Offset must be an integer').min(0, 'Offset cannot be negative').optional(),
});

// Metrics Filter Schema
export const metricsFilterSchema = yup.object().shape({
  clientId: yup.string().matches(uuidRegex, 'Client ID must be a valid UUID').optional(),
  userId: yup.string().matches(uuidRegex, 'User ID must be a valid UUID').optional(),
  dateFrom: yup.date().optional(),
  dateTo: yup.date().optional(),
});

// Export individual validation functions for convenience
export const validateLogin = (data: any) => loginSchema.validate(data, { abortEarly: false });
export const validateRegister = (data: any) => registerSchema.validate(data, { abortEarly: false });
export const validateCreateCall = (data: any) => createCallSchema.validate(data, { abortEarly: false });
export const validateUpdateCall = (data: any) => updateCallSchema.validate(data, { abortEarly: false });
export const validateCreateUser = (data: any) => createUserSchema.validate(data, { abortEarly: false });
export const validateCallFilter = (data: any) => callFilterSchema.validate(data, { abortEarly: false });
export const validateMetricsFilter = (data: any) => metricsFilterSchema.validate(data, { abortEarly: false });
