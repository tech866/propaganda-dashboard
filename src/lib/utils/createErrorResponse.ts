import { NextResponse } from 'next/server';

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

export function createErrorResponse(
  message: string,
  code?: string,
  status: number = 500,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<{
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
