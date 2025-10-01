import * as yup from 'yup';

// Common validation patterns
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/; // International phone number format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Call validation schemas
export const createCallSchema = yup.object({
  client_id: yup
    .string()
    .required('Client ID is required')
    .matches(uuidRegex, 'Client ID must be a valid UUID'),
  
  prospect_name: yup
    .string()
    .required('Prospect name is required')
    .min(2, 'Prospect name must be at least 2 characters')
    .max(100, 'Prospect name must be less than 100 characters')
    .trim(),
  
  prospect_email: yup
    .string()
    .optional()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  prospect_phone: yup
    .string()
    .optional()
    .matches(phoneRegex, 'Invalid phone number format')
    .max(20, 'Phone number must be less than 20 characters'),
  
  call_type: yup
    .string()
    .required('Call type is required')
    .oneOf(['inbound', 'outbound'], 'Call type must be either inbound or outbound'),
  
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['completed', 'no-show', 'rescheduled'], 'Status must be completed, no-show, or rescheduled'),
  
  outcome: yup
    .string()
    .optional()
    .oneOf(['won', 'lost', 'tbd'], 'Outcome must be won, lost, or tbd'),
  
  loss_reason_id: yup
    .string()
    .optional()
    .matches(uuidRegex, 'Loss reason ID must be a valid UUID'),
  
  notes: yup
    .string()
    .optional()
    .max(1000, 'Notes must be less than 1000 characters')
    .trim(),
  
  call_duration: yup
    .number()
    .optional()
    .min(0, 'Call duration must be positive')
    .max(1440, 'Call duration must be less than 24 hours (1440 minutes)')
    .integer('Call duration must be a whole number'),
  
  scheduled_at: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Scheduled date cannot be before 1900')
    .max(new Date('2100-12-31'), 'Scheduled date cannot be after 2100'),
  
  completed_at: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Completed date cannot be before 1900')
    .max(new Date('2100-12-31'), 'Completed date cannot be after 2100'),
  
  // Enhanced call logging form fields
  closer_first_name: yup
    .string()
    .optional()
    .min(2, 'Closer first name must be at least 2 characters')
    .max(100, 'Closer first name must be less than 100 characters')
    .trim(),
  
  closer_last_name: yup
    .string()
    .optional()
    .min(2, 'Closer last name must be at least 2 characters')
    .max(100, 'Closer last name must be less than 100 characters')
    .trim(),
  
  source_of_set_appointment: yup
    .string()
    .optional()
    .oneOf(['sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking'], 'Invalid source of set appointment'),
  
  enhanced_call_outcome: yup
    .string()
    .optional()
    .oneOf(['no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'], 'Invalid enhanced call outcome'),
  
  initial_payment_collected_on: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Payment date cannot be before 1900')
    .max(new Date('2100-12-31'), 'Payment date cannot be after 2100'),
  
  customer_full_name: yup
    .string()
    .optional()
    .min(2, 'Customer full name must be at least 2 characters')
    .max(255, 'Customer full name must be less than 255 characters')
    .trim(),
  
  customer_email: yup
    .string()
    .optional()
    .email('Invalid customer email format')
    .max(255, 'Customer email must be less than 255 characters'),
  
  calls_taken: yup
    .number()
    .optional()
    .min(1, 'Calls taken must be at least 1')
    .max(100, 'Calls taken must be less than 100')
    .integer('Calls taken must be a whole number'),
  
  setter_first_name: yup
    .string()
    .optional()
    .min(2, 'Setter first name must be at least 2 characters')
    .max(100, 'Setter first name must be less than 100 characters')
    .trim(),
  
  setter_last_name: yup
    .string()
    .optional()
    .min(2, 'Setter last name must be at least 2 characters')
    .max(100, 'Setter last name must be less than 100 characters')
    .trim(),
  
  cash_collected_upfront: yup
    .number()
    .optional()
    .min(0, 'Cash collected upfront cannot be negative')
    .max(999999.99, 'Cash collected upfront must be less than $1,000,000'),
  
  total_amount_owed: yup
    .number()
    .optional()
    .min(0, 'Total amount owed cannot be negative')
    .max(999999.99, 'Total amount owed must be less than $1,000,000'),
  
  prospect_notes: yup
    .string()
    .optional()
    .max(2000, 'Prospect notes must be less than 2000 characters')
    .trim(),
  
  lead_source: yup
    .string()
    .optional()
    .oneOf(['organic', 'ads'], 'Lead source must be either organic or ads'),
});

export const updateCallSchema = yup.object({
  prospect_name: yup
    .string()
    .optional()
    .min(2, 'Prospect name must be at least 2 characters')
    .max(100, 'Prospect name must be less than 100 characters')
    .trim(),
  
  prospect_email: yup
    .string()
    .optional()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  prospect_phone: yup
    .string()
    .optional()
    .matches(phoneRegex, 'Invalid phone number format')
    .max(20, 'Phone number must be less than 20 characters'),
  
  call_type: yup
    .string()
    .optional()
    .oneOf(['inbound', 'outbound'], 'Call type must be either inbound or outbound'),
  
  status: yup
    .string()
    .optional()
    .oneOf(['completed', 'no-show', 'rescheduled'], 'Status must be completed, no-show, or rescheduled'),
  
  outcome: yup
    .string()
    .optional()
    .oneOf(['won', 'lost', 'tbd'], 'Outcome must be won, lost, or tbd'),
  
  loss_reason_id: yup
    .string()
    .optional()
    .matches(uuidRegex, 'Loss reason ID must be a valid UUID'),
  
  notes: yup
    .string()
    .optional()
    .max(1000, 'Notes must be less than 1000 characters')
    .trim(),
  
  call_duration: yup
    .number()
    .optional()
    .min(0, 'Call duration must be positive')
    .max(1440, 'Call duration must be less than 24 hours (1440 minutes)')
    .integer('Call duration must be a whole number'),
  
  scheduled_at: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Scheduled date cannot be before 1900')
    .max(new Date('2100-12-31'), 'Scheduled date cannot be after 2100'),
  
  completed_at: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Completed date cannot be before 1900')
    .max(new Date('2100-12-31'), 'Completed date cannot be after 2100'),
  
  // Enhanced call logging form fields
  closer_first_name: yup
    .string()
    .optional()
    .min(2, 'Closer first name must be at least 2 characters')
    .max(100, 'Closer first name must be less than 100 characters')
    .trim(),
  
  closer_last_name: yup
    .string()
    .optional()
    .min(2, 'Closer last name must be at least 2 characters')
    .max(100, 'Closer last name must be less than 100 characters')
    .trim(),
  
  source_of_set_appointment: yup
    .string()
    .optional()
    .oneOf(['sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking'], 'Invalid source of set appointment'),
  
  enhanced_call_outcome: yup
    .string()
    .optional()
    .oneOf(['no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'], 'Invalid enhanced call outcome'),
  
  initial_payment_collected_on: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Payment date cannot be before 1900')
    .max(new Date('2100-12-31'), 'Payment date cannot be after 2100'),
  
  customer_full_name: yup
    .string()
    .optional()
    .min(2, 'Customer full name must be at least 2 characters')
    .max(255, 'Customer full name must be less than 255 characters')
    .trim(),
  
  customer_email: yup
    .string()
    .optional()
    .email('Invalid customer email format')
    .max(255, 'Customer email must be less than 255 characters'),
  
  calls_taken: yup
    .number()
    .optional()
    .min(1, 'Calls taken must be at least 1')
    .max(100, 'Calls taken must be less than 100')
    .integer('Calls taken must be a whole number'),
  
  setter_first_name: yup
    .string()
    .optional()
    .min(2, 'Setter first name must be at least 2 characters')
    .max(100, 'Setter first name must be less than 100 characters')
    .trim(),
  
  setter_last_name: yup
    .string()
    .optional()
    .min(2, 'Setter last name must be at least 2 characters')
    .max(100, 'Setter last name must be less than 100 characters')
    .trim(),
  
  cash_collected_upfront: yup
    .number()
    .optional()
    .min(0, 'Cash collected upfront cannot be negative')
    .max(999999.99, 'Cash collected upfront must be less than $1,000,000'),
  
  total_amount_owed: yup
    .number()
    .optional()
    .min(0, 'Total amount owed cannot be negative')
    .max(999999.99, 'Total amount owed must be less than $1,000,000'),
  
  prospect_notes: yup
    .string()
    .optional()
    .max(2000, 'Prospect notes must be less than 2000 characters')
    .trim(),
  
  lead_source: yup
    .string()
    .optional()
    .oneOf(['organic', 'ads'], 'Lead source must be either organic or ads'),
});

// User validation schemas
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export const registerSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  clientId: yup
    .string()
    .required('Client ID is required')
    .matches(uuidRegex, 'Client ID must be a valid UUID'),
});

export const createUserSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['ceo', 'admin', 'sales'], 'Role must be ceo, admin, or sales'),
  
  clientId: yup
    .string()
    .required('Client ID is required')
    .matches(uuidRegex, 'Client ID must be a valid UUID'),
});

// Loss reason validation schema
export const createLossReasonSchema = yup.object({
  name: yup
    .string()
    .required('Loss reason name is required')
    .min(2, 'Loss reason name must be at least 2 characters')
    .max(100, 'Loss reason name must be less than 100 characters')
    .trim(),
  
  description: yup
    .string()
    .optional()
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  
  client_id: yup
    .string()
    .required('Client ID is required')
    .matches(uuidRegex, 'Client ID must be a valid UUID'),
});

// Metrics filter validation schema
export const metricsFilterSchema = yup.object({
  clientId: yup
    .string()
    .optional()
    .matches(uuidRegex, 'Client ID must be a valid UUID'),
  
  userId: yup
    .string()
    .optional()
    .matches(uuidRegex, 'User ID must be a valid UUID'),
  
  dateFrom: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Date from cannot be before 1900')
    .max(new Date('2100-12-31'), 'Date from cannot be after 2100'),
  
  dateTo: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Date to cannot be before 1900')
    .max(new Date('2100-12-31'), 'Date to cannot be after 2100'),
}).test('date-range', 'Date from must be before date to', function(value) {
  if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
    return this.createError({
      message: 'Date from must be before date to',
      path: 'dateFrom',
    });
  }
  return true;
});

// Call filter validation schema
export const callFilterSchema = yup.object({
  clientId: yup
    .string()
    .optional()
    .matches(uuidRegex, 'Client ID must be a valid UUID'),
  
  userId: yup
    .string()
    .optional()
    .matches(uuidRegex, 'User ID must be a valid UUID'),
  
  dateFrom: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Date from cannot be before 1900')
    .max(new Date('2100-12-31'), 'Date from cannot be after 2100'),
  
  dateTo: yup
    .date()
    .optional()
    .min(new Date('1900-01-01'), 'Date to cannot be before 1900')
    .max(new Date('2100-12-31'), 'Date to cannot be after 2100'),
  
  limit: yup
    .number()
    .optional()
    .min(1, 'Limit must be at least 1')
    .max(1000, 'Limit must be less than 1000')
    .integer('Limit must be a whole number'),
  
  offset: yup
    .number()
    .optional()
    .min(0, 'Offset must be non-negative')
    .integer('Offset must be a whole number'),
}).test('date-range', 'Date from must be before date to', function(value) {
  if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
    return this.createError({
      message: 'Date from must be before date to',
      path: 'dateFrom',
    });
  }
  return true;
});

// Export all schemas for easy access
export const validationSchemas = {
  createCall: createCallSchema,
  updateCall: updateCallSchema,
  login: loginSchema,
  register: registerSchema,
  createUser: createUserSchema,
  createLossReason: createLossReasonSchema,
  metricsFilter: metricsFilterSchema,
  callFilter: callFilterSchema,
} as const;

// Type exports for TypeScript
export type CreateCallData = yup.InferType<typeof createCallSchema>;
export type UpdateCallData = yup.InferType<typeof updateCallSchema>;
export type LoginData = yup.InferType<typeof loginSchema>;
export type RegisterData = yup.InferType<typeof registerSchema>;
export type CreateUserData = yup.InferType<typeof createUserSchema>;
export type CreateLossReasonData = yup.InferType<typeof createLossReasonSchema>;
export type MetricsFilterData = yup.InferType<typeof metricsFilterSchema>;
export type CallFilterData = yup.InferType<typeof callFilterSchema>;
