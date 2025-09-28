import { NextRequest, NextResponse } from 'next/server';
import { createValidationError, withErrorHandling, formatErrorResponse } from '@/middleware/errors';

// GET /api/test-validation-error - Test validation error handling (simple)
const testValidationErrorGet = async (request: NextRequest) => {
  try {
    // Just throw a validation error without reading the body
    throw createValidationError('This is a test validation error from test-validation-error endpoint', {
      field: 'testField',
      reason: 'testReason'
    });
  } catch (error) {
    return formatErrorResponse(error);
  }
};

// POST /api/test-validation-error - Test validation error handling (with body)
const testValidationErrorPost = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // Test validation with the provided data
  if (!body.email || !body.password) {
    throw createValidationError('Validation failed', {
      email: 'Email is required',
      password: 'Password is required'
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Validation passed',
    data: body
  });
});

export const GET = testValidationErrorGet;
export const POST = testValidationErrorPost;
