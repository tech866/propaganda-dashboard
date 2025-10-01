import { useState, useCallback, useEffect } from 'react';
import { enhancedCallLoggingSchema, validateEnhancedCallField, validateBusinessLogic } from '@/lib/validation/enhancedCallSchemas';

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

export interface EnhancedFormState {
  errors: ValidationError[];
  isValidating: boolean;
  touchedFields: Set<string>;
  fieldErrors: Map<string, string>;
}

export function useEnhancedFormValidation<T>(initialData?: Partial<T>) {
  const [formState, setFormState] = useState<EnhancedFormState>({
    errors: [],
    isValidating: false,
    touchedFields: new Set(),
    fieldErrors: new Map(),
  });

  // Real-time field validation
  const validateField = useCallback(async (fieldName: string, value: any, formData?: any): Promise<string | null> => {
    try {
      const error = await validateEnhancedCallField(fieldName, value, formData);
      return error;
    } catch (error: any) {
      return error.message || 'Validation failed';
    }
  }, []);

  // Mark field as touched
  const touchField = useCallback((fieldName: string) => {
    setFormState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, fieldName]),
    }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((fieldName: string) => {
    setFormState(prev => {
      const newFieldErrors = new Map(prev.fieldErrors);
      newFieldErrors.delete(fieldName);
      return {
        ...prev,
        fieldErrors: newFieldErrors,
      };
    });
  }, []);

  // Set field error
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setFormState(prev => {
      const newFieldErrors = new Map(prev.fieldErrors);
      newFieldErrors.set(fieldName, error);
      return {
        ...prev,
        fieldErrors: newFieldErrors,
      };
    });
  }, []);

  // Real-time validation on field change
  const handleFieldChange = useCallback(async (fieldName: string, value: any, formData?: any) => {
    touchField(fieldName);
    
    // Clear existing error
    clearFieldError(fieldName);
    
    // Validate field if it's been touched
    if (formState.touchedFields.has(fieldName)) {
      const error = await validateField(fieldName, value, formData);
      if (error) {
        setFieldError(fieldName, error);
      }
    }
  }, [formState.touchedFields, validateField, touchField, clearFieldError, setFieldError]);

  // Full form validation
  const validate = useCallback(async (data: any): Promise<ValidationResult<T>> => {
    setFormState(prev => ({ ...prev, isValidating: true, errors: [] }));

    try {
      // Validate with Yup schema
      const validatedData = await enhancedCallLoggingSchema.validate(data, { 
        abortEarly: false, 
        stripUnknown: true 
      });
      
      // Additional business logic validation
      const businessLogicErrors = validateBusinessLogic(data);
      
      if (businessLogicErrors.length > 0) {
        const validationErrors: ValidationError[] = businessLogicErrors.map(error => ({
          field: 'general',
          message: error,
        }));
        
        setFormState(prev => ({
          ...prev,
          isValidating: false,
          errors: validationErrors,
        }));
        
        return { 
          isValid: false, 
          errors: validationErrors, 
          errorMessage: businessLogicErrors.join(', ') 
        };
      }
      
      setFormState(prev => ({ ...prev, isValidating: false }));
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

      setFormState(prev => ({
        ...prev,
        isValidating: false,
        errors: validationErrors,
      }));
      
      return { 
        isValid: false, 
        errors: validationErrors, 
        errorMessage: error.message || 'Validation failed' 
      };
    }
  }, []);

  // Validate all fields
  const validateAllFields = useCallback(async (formData: any) => {
    const fieldErrors = new Map<string, string>();
    
    // Validate each field
    for (const [fieldName, value] of Object.entries(formData)) {
      const error = await validateField(fieldName, value, formData);
      if (error) {
        fieldErrors.set(fieldName, error);
      }
    }
    
    setFormState(prev => ({
      ...prev,
      fieldErrors,
    }));
    
    return fieldErrors.size === 0;
  }, [validateField]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      errors: [],
      fieldErrors: new Map(),
    }));
  }, []);

  // Clear all field errors
  const clearAllFieldErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      fieldErrors: new Map(),
    }));
  }, []);

  // Get field error
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return formState.fieldErrors.get(fieldName) || 
           formState.errors.find(error => error.field === fieldName)?.message;
  }, [formState.fieldErrors, formState.errors]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return formState.fieldErrors.has(fieldName) || 
           formState.errors.some(error => error.field === fieldName);
  }, [formState.fieldErrors, formState.errors]);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return formState.touchedFields.has(fieldName);
  }, [formState.touchedFields]);

  // Get general errors (not field-specific)
  const getGeneralErrors = useCallback((): string[] => {
    return formState.errors
      .filter(error => error.field === 'general')
      .map(error => error.message);
  }, [formState.errors]);

  // Check if form is valid
  const isFormValid = useCallback((): boolean => {
    return formState.errors.length === 0 && formState.fieldErrors.size === 0;
  }, [formState.errors, formState.fieldErrors]);

  // Reset form state
  const resetForm = useCallback(() => {
    setFormState({
      errors: [],
      isValidating: false,
      touchedFields: new Set(),
      fieldErrors: new Map(),
    });
  }, []);

  return {
    // Validation functions
    validate,
    validateField,
    validateAllFields,
    handleFieldChange,
    
    // Error management
    clearErrors,
    clearFieldError,
    clearAllFieldErrors,
    getFieldError,
    hasFieldError,
    getGeneralErrors,
    
    // Field state
    touchField,
    isFieldTouched,
    
    // Form state
    isFormValid,
    resetForm,
    
    // State
    errors: formState.errors,
    fieldErrors: formState.fieldErrors,
    isValidating: formState.isValidating,
    touchedFields: formState.touchedFields,
  };
}
