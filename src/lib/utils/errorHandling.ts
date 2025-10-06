import { NextRequest, NextResponse } from 'next/server';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export function createValidationError(
  field: string,
  message: string,
  value?: any
): ValidationError {
  return {
    field,
    message,
    value,
  };
}

export function createNotFoundError(resource: string): ApiError {
  return {
    message: `${resource} not found`,
    code: 'NOT_FOUND',
    status: 404,
  };
}

export function createUnauthorizedError(message: string = 'Unauthorized'): ApiError {
  return {
    message,
    code: 'UNAUTHORIZED',
    status: 401,
  };
}

export function createForbiddenError(message: string = 'Forbidden'): ApiError {
  return {
    message,
    code: 'FORBIDDEN',
    status: 403,
  };
}

export function createBadRequestError(message: string, details?: any): ApiError {
  return {
    message,
    code: 'BAD_REQUEST',
    status: 400,
    details,
  };
}

export function createInternalServerError(message: string = 'Internal Server Error'): ApiError {
  return {
    message,
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
  };
}

export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: 'INTERNAL_SERVER_ERROR',
            },
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'An unexpected error occurred',
            code: 'INTERNAL_SERVER_ERROR',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}
