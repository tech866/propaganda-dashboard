import { NextRequest, NextResponse } from 'next/server';
import { CallService, CreateCallData } from '@/lib/services/callService';
import { withErrorHandling, createValidationError, validateRequiredFields } from '@/middleware/errors';

// Mock user for testing
const mockUser = {
  id: '650e8400-e29b-41d4-a716-446655440003',
  email: 'sales1@propaganda.com',
  name: 'John Doe',
  role: 'sales' as const,
  clientId: '550e8400-e29b-41d4-a716-446655440001',
  permissions: ['read:own-calls', 'write:own-calls', 'read:own-metrics']
};

// POST /api/test-create-call - Test call creation without authentication
const testCreateCall = withErrorHandling(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Test validation rules
    const requiredFields = ['client_id', 'prospect_name', 'call_type', 'status'];
    const validation = validateRequiredFields(body, requiredFields);
    
    if (!validation.isValid) {
      throw createValidationError('Missing required fields', {
        missingFields: validation.missingFields
      });
    }

    // Create call data object
    const callData: CreateCallData = {
      client_id: body.client_id,
      prospect_name: body.prospect_name,
      prospect_email: body.prospect_email || undefined,
      prospect_phone: body.prospect_phone || undefined,
      call_type: body.call_type,
      status: body.status,
      outcome: body.outcome || 'tbd',
      loss_reason_id: body.loss_reason_id || undefined,
      notes: body.notes || undefined,
      call_duration: body.call_duration || undefined,
      scheduled_at: body.scheduled_at || undefined,
      completed_at: body.completed_at || undefined,
    };

    // Create call in database
    const newCall = await CallService.createCall(callData, mockUser);

    return NextResponse.json(
      {
        success: true,
        message: 'Call created successfully',
        data: newCall,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Call creation test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});

export const POST = testCreateCall;
