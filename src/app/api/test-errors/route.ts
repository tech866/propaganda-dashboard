import { NextRequest, NextResponse } from 'next/server';
import { 
  createValidationError,
  createNotFoundError,
  createConflictError,
  createRateLimitError,
  createDatabaseError,
  createInternalServerError,
  createBadRequestError,
  formatErrorResponse,
  withErrorHandling,
  checkRateLimit
} from '@/middleware/errors';

// GET /api/test-errors - Test various error scenarios
async function testErrors(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const errorType = searchParams.get('type');

    // Rate limiting test
    const rateLimitResult = checkRateLimit('test-errors', 5, 60000); // 5 requests per minute
    if (!rateLimitResult.allowed) {
      throw createRateLimitError('Too many test requests');
    }

    switch (errorType) {
      case 'validation':
        throw createValidationError('Test validation error', {
          field: 'email',
          message: 'Invalid email format'
        });

      case 'not-found':
        throw createNotFoundError('Test resource');

      case 'conflict':
        throw createConflictError('Test resource already exists');

      case 'database':
        throw createDatabaseError('Connection to database failed');

      case 'internal':
        throw createInternalServerError('Test internal server error');

      case 'bad-request':
        throw createBadRequestError('Test bad request error');

      case 'throw':
        // Test generic error handling
        throw new Error('Generic error for testing');

      case 'json':
        // Test JSON parsing error
        throw new SyntaxError('Unexpected token in JSON');

      default:
        return NextResponse.json({
          success: true,
          message: 'Error testing endpoint',
          availableTests: [
            'validation',
            'not-found', 
            'conflict',
            'database',
            'internal',
            'bad-request',
            'throw',
            'json'
          ],
          usage: 'Add ?type=<errorType> to test specific error scenarios',
          rateLimit: {
            allowed: rateLimitResult.allowed,
            remaining: rateLimitResult.remaining,
            resetTime: new Date(rateLimitResult.resetTime).toISOString()
          }
        });
    }
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
}

// Export the handler
export const GET = testErrors;
