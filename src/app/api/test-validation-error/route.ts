import { NextRequest, NextResponse } from 'next/server';
import { createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateLogin } from '@/lib/validation';

// POST /api/test-validation-error - Test validation error handling
const testValidationError = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // Test validation
  const validation = await validateLogin(body);
  
  if (!validation.isValid) {
    throw createValidationError('Validation failed', validation.errors);
  }

  return NextResponse.json({
    success: true,
    message: 'Validation passed',
    data: validation.data
  });
});

export const POST = testValidationError;
