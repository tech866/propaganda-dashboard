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

// Create Call Schema
export const createCallSchema = yup.object().shape({
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
