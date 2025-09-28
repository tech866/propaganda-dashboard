import { NextResponse } from 'next/server';

// Error types for different scenarios
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR'
}

// Custom error class for API errors
export class APIError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number,
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Predefined error creators
export const createValidationError = (message: string, details?: any) =>
  new APIError(message, ErrorType.VALIDATION_ERROR, 400, details);

export const createAuthenticationError = (message: string = 'Authentication required') =>
  new APIError(message, ErrorType.AUTHENTICATION_ERROR, 401);

export const createAuthorizationError = (message: string = 'Insufficient permissions') =>
  new APIError(message, ErrorType.AUTHORIZATION_ERROR, 403);

export const createNotFoundError = (resource: string = 'Resource') =>
  new APIError(`${resource} not found`, ErrorType.NOT_FOUND_ERROR, 404);

export const createConflictError = (message: string) =>
  new APIError(message, ErrorType.CONFLICT_ERROR, 409);

export const createRateLimitError = (message: string = 'Rate limit exceeded') =>
  new APIError(message, ErrorType.RATE_LIMIT_ERROR, 429);

export const createDatabaseError = (message: string = 'Database operation failed') =>
  new APIError(message, ErrorType.DATABASE_ERROR, 500);

export const createInternalServerError = (message: string = 'Internal server error') =>
  new APIError(message, ErrorType.INTERNAL_SERVER_ERROR, 500);

export const createBadRequestError = (message: string) =>
  new APIError(message, ErrorType.BAD_REQUEST_ERROR, 400);

// Error response formatter
export function formatErrorResponse(error: Error): NextResponse {
  // Handle our custom API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: error.type,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString()
        }
      },
      { status: error.statusCode }
    );
  }

  // Handle validation errors (from libraries like Zod)
  if (error.name === 'ZodError') {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: ErrorType.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.message,
          timestamp: new Date().toISOString()
        }
      },
      { status: 400 }
    );
  }

  // Handle database connection errors
  if (error.message.includes('ECONNREFUSED') || error.message.includes('database')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: ErrorType.DATABASE_ERROR,
          message: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString()
        }
      },
      { status: 503 }
    );
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return NextResponse.json(
      {
        success: false,
        error: {
          type: ErrorType.AUTHENTICATION_ERROR,
          message: 'Invalid or expired token',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString()
        }
      },
      { status: 401 }
    );
  }

  // Handle generic errors
  return NextResponse.json(
    {
      success: false,
      error: {
        type: ErrorType.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      }
    },
    { status: 500 }
  );
}

// Async error handler wrapper
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Log error for debugging (in production, use proper logging service)
      console.error('API Error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });

      // Return error response instead of re-throwing
      return formatErrorResponse(error instanceof Error ? error : new Error(String(error))) as R;
    }
  };
}

// Input validation helpers
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }

  // Increment count
  current.count++;
  rateLimitMap.set(key, current);

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  };
}
