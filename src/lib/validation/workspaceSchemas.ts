// =====================================================
// Workspace Validation Schemas
// Task 20.2: Workspace Provisioning APIs
// =====================================================

import * as yup from 'yup';
import { WORKSPACE_SLUG_REGEX, WORKSPACE_NAME_MIN_LENGTH, WORKSPACE_NAME_MAX_LENGTH, WORKSPACE_SLUG_MIN_LENGTH, WORKSPACE_SLUG_MAX_LENGTH, WORKSPACE_DESCRIPTION_MAX_LENGTH } from '../types/workspace';

// =====================================================
// Workspace Creation Schema
// =====================================================

export const createWorkspaceSchema = yup.object().shape({
  name: yup
    .string()
    .min(WORKSPACE_NAME_MIN_LENGTH, `Workspace name must be at least ${WORKSPACE_NAME_MIN_LENGTH} characters`)
    .max(WORKSPACE_NAME_MAX_LENGTH, `Workspace name must be no more than ${WORKSPACE_NAME_MAX_LENGTH} characters`)
    .required('Workspace name is required'),
  
  slug: yup
    .string()
    .min(WORKSPACE_SLUG_MIN_LENGTH, `Workspace slug must be at least ${WORKSPACE_SLUG_MIN_LENGTH} characters`)
    .max(WORKSPACE_SLUG_MAX_LENGTH, `Workspace slug must be no more than ${WORKSPACE_SLUG_MAX_LENGTH} characters`)
    .matches(WORKSPACE_SLUG_REGEX, 'Workspace slug can only contain lowercase letters, numbers, and hyphens')
    .required('Workspace slug is required'),
  
  description: yup
    .string()
    .max(WORKSPACE_DESCRIPTION_MAX_LENGTH, `Description must be no more than ${WORKSPACE_DESCRIPTION_MAX_LENGTH} characters`)
    .optional()
    .nullable(),
  
  settings: yup
    .object()
    .optional()
    .default({})
});

// =====================================================
// Workspace Update Schema
// =====================================================

export const updateWorkspaceSchema = yup.object().shape({
  name: yup
    .string()
    .min(WORKSPACE_NAME_MIN_LENGTH, `Workspace name must be at least ${WORKSPACE_NAME_MIN_LENGTH} characters`)
    .max(WORKSPACE_NAME_MAX_LENGTH, `Workspace name must be no more than ${WORKSPACE_NAME_MAX_LENGTH} characters`)
    .optional(),
  
  slug: yup
    .string()
    .min(WORKSPACE_SLUG_MIN_LENGTH, `Workspace slug must be at least ${WORKSPACE_SLUG_MIN_LENGTH} characters`)
    .max(WORKSPACE_SLUG_MAX_LENGTH, `Workspace slug must be no more than ${WORKSPACE_SLUG_MAX_LENGTH} characters`)
    .matches(WORKSPACE_SLUG_REGEX, 'Workspace slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  
  description: yup
    .string()
    .max(WORKSPACE_DESCRIPTION_MAX_LENGTH, `Description must be no more than ${WORKSPACE_DESCRIPTION_MAX_LENGTH} characters`)
    .optional()
    .nullable(),
  
  settings: yup
    .object()
    .optional(),
  
  is_active: yup
    .boolean()
    .optional()
});

// =====================================================
// Invitation Schema
// =====================================================

export const invitationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  
  role: yup
    .string()
    .oneOf(['admin', 'manager', 'sales_rep', 'client', 'viewer'], 'Invalid role')
    .required('Role is required'),
  
  expires_in_hours: yup
    .number()
    .min(1, 'Expiration must be at least 1 hour')
    .max(720, 'Expiration cannot exceed 30 days (720 hours)')
    .optional()
    .default(168) // 7 days
});

// =====================================================
// Membership Update Schema
// =====================================================

export const updateMembershipSchema = yup.object().shape({
  role: yup
    .string()
    .oneOf(['admin', 'manager', 'sales_rep', 'client', 'viewer'], 'Invalid role')
    .optional(),
  
  status: yup
    .string()
    .oneOf(['active', 'pending', 'suspended', 'removed'], 'Invalid status')
    .optional(),
  
  permissions: yup
    .object()
    .optional()
});

// =====================================================
// Validation Helper Functions
// =====================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateWorkspaceData(data: any): ValidationResult {
  try {
    createWorkspaceSchema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.errors
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error']
    };
  }
}

export function validateWorkspaceUpdate(data: any): ValidationResult {
  try {
    updateWorkspaceSchema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.errors
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error']
    };
  }
}

export function validateInvitationData(data: any): ValidationResult {
  try {
    invitationSchema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.errors
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error']
    };
  }
}

export function validateMembershipUpdate(data: any): ValidationResult {
  try {
    updateMembershipSchema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.errors
      };
    }
    return {
      isValid: false,
      errors: ['Unknown validation error']
    };
  }
}

// =====================================================
// Utility Functions
// =====================================================

export function generateWorkspaceSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, WORKSPACE_SLUG_MAX_LENGTH);
}

export function validateWorkspaceSlug(slug: string): boolean {
  return WORKSPACE_SLUG_REGEX.test(slug) && 
         slug.length >= WORKSPACE_SLUG_MIN_LENGTH && 
         slug.length <= WORKSPACE_SLUG_MAX_LENGTH;
}
