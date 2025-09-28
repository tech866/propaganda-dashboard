import { useState, useCallback } from 'react';
import { Schema } from 'yup';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
  errorMessage?: string;
}

export function useFormValidation<T>(schema: Schema<T>) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (data: any): Promise<ValidationResult<T>> => {
    setIsValidating(true);
    setErrors([]);

    try {
      const validatedData = await schema.validate(data, { 
        abortEarly: false, 
        stripUnknown: true 
      });
      
      setIsValidating(false);
      return { isValid: true, data: validatedData };
    } catch (error: any) {
      const validationErrors: ValidationError[] = [];
      
      if (error.inner) {
        error.inner.forEach((err: any) => {
          if (err.path) {
            validationErrors.push({
              field: err.path,
              message: err.message
            });
          }
        });
      } else {
        validationErrors.push({
          field: 'general',
          message: error.message || 'Validation failed'
        });
      }

      setErrors(validationErrors);
      setIsValidating(false);
      
      return { 
        isValid: false, 
        errors: validationErrors, 
        errorMessage: error.message || 'Validation failed' 
      };
    }
  }, [schema]);

  const validateField = useCallback(async (field: string, value: any): Promise<ValidationError | null> => {
    try {
      await schema.validateAt(field, { [field]: value });
      return null;
    } catch (error: any) {
      return {
        field,
        message: error.message
      };
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  }, [errors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return errors.some(error => error.field === fieldName);
  }, [errors]);

  return {
    validate,
    validateField,
    clearErrors,
    getFieldError,
    hasFieldError,
    errors,
    isValidating
  };
}
