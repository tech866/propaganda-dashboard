import * as yup from 'yup';
import { validationSchemas } from './schemas';

// Validation result interface
export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string>;
  errorMessage?: string;
}

// Generic validation function
export async function validateData<T>(
  schema: yup.Schema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const validatedData = await schema.validate(data, { abortEarly: false });
    return {
      isValid: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });

      return {
        isValid: false,
        errors,
        errorMessage: error.message,
      };
    }

    return {
      isValid: false,
      errorMessage: 'Validation failed',
    };
  }
}

// Specific validation functions for each schema
export const validateCreateCall = (data: unknown) =>
  validateData(validationSchemas.createCall, data);

export const validateUpdateCall = (data: unknown) =>
  validateData(validationSchemas.updateCall, data);

export const validateLogin = (data: unknown) =>
  validateData(validationSchemas.login, data);

export const validateRegister = (data: unknown) =>
  validateData(validationSchemas.register, data);

export const validateCreateUser = (data: unknown) =>
  validateData(validationSchemas.createUser, data);

export const validateCreateLossReason = (data: unknown) =>
  validateData(validationSchemas.createLossReason, data);

export const validateMetricsFilter = (data: unknown) =>
  validateData(validationSchemas.metricsFilter, data);

export const validateCallFilter = (data: unknown) =>
  validateData(validationSchemas.callFilter, data);

// Client-side validation hook helper
export function createValidationHook<T>(
  schema: yup.Schema<T>
) {
  return {
    validate: (data: unknown) => validateData(schema, data),
    validateField: async (field: string, value: unknown) => {
      try {
        await schema.validateAt(field, { [field]: value });
        return { isValid: true };
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          return {
            isValid: false,
            error: error.message,
          };
        }
        return {
          isValid: false,
          error: 'Validation failed',
        };
      }
    },
  };
}

// Server-side validation middleware helper
export function createValidationMiddleware<T>(
  schema: yup.Schema<T>,
  getData: (req: any) => unknown
) {
  return async (req: any, res: any, next: any) => {
    try {
      const data = getData(req);
      const result = await validateData(schema, data);
      
      if (!result.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: result.errors,
        });
      }
      
      // Attach validated data to request
      req.validatedData = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
      });
    }
  };
}

// Utility function to format validation errors for display
export function formatValidationErrors(errors: Record<string, string>): string[] {
  return Object.entries(errors).map(([field, message]) => {
    const formattedField = field.replace(/([A-Z])/g, ' $1').toLowerCase();
    return `${formattedField}: ${message}`;
  });
}

// Utility function to get the first validation error
export function getFirstValidationError(errors: Record<string, string>): string | null {
  const errorMessages = Object.values(errors);
  return errorMessages.length > 0 ? errorMessages[0] : null;
}

// Export all validation functions
export const validators = {
  createCall: validateCreateCall,
  updateCall: validateUpdateCall,
  login: validateLogin,
  register: validateRegister,
  createUser: validateCreateUser,
  createLossReason: validateCreateLossReason,
  metricsFilter: validateMetricsFilter,
  callFilter: validateCallFilter,
} as const;
