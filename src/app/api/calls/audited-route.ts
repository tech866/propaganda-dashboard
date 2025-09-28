/**
 * Audited Calls API Route
 * Demonstrates integration with audit middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { withAudit, auditDataChange, extractAuditContext } from '@/middleware/audit';
import { createAuditedDatabase } from '@/lib/services/auditedDatabase';
import { validateCreateCall, validateCallFilter } from '@/lib/validation';

// GET /api/calls - Get all calls with audit logging
const getCalls = withErrorHandling(withAudit(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Prepare filter data for validation
  const filterData = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
  };

  // Validate filter parameters
  const filterValidation = await validateCallFilter(filterData);
  if (!filterValidation.isValid) {
    throw createValidationError('Invalid filter parameters', filterValidation.errors);
  }

  const validatedFilters = filterValidation.data!;
  const requestedClientId = validatedFilters.clientId;
  const userId = validatedFilters.userId;
  const dateFrom = validatedFilters.dateFrom;
  const dateTo = validatedFilters.dateTo;
  const limit = validatedFilters.limit || 100;
  const offset = validatedFilters.offset || 0;

  // Validate client access
  if (requestedClientId && !canAccessClient(user, requestedClientId)) {
    throw createAuthorizationError('Access denied to client data');
  }

  // Create audited database service
  const auditedDb = createAuditedDatabase(request, user);

  // Build query with audit logging
  let query = `
    SELECT c.*, u.email as user_email, cl.name as client_name
    FROM calls c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN clients cl ON c.client_id = cl.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramIndex = 1;

  // Apply client filter
  if (requestedClientId) {
    query += ` AND c.client_id = $${paramIndex++}`;
    params.push(requestedClientId);
  } else if (user.role === 'sales') {
    query += ` AND c.client_id = $${paramIndex++}`;
    params.push(user.clientId);
  }

  // Apply user filter
  if (userId) {
    query += ` AND c.user_id = $${paramIndex++}`;
    params.push(userId);
  } else if (user.role === 'sales') {
    query += ` AND c.user_id = $${paramIndex++}`;
    params.push(user.id);
  }

  // Apply date filters
  if (dateFrom) {
    query += ` AND c.created_at >= $${paramIndex++}`;
    params.push(dateFrom);
  }
  
  if (dateTo) {
    query += ` AND c.created_at <= $${paramIndex++}`;
    params.push(dateTo);
  }

  query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  // Execute query with audit logging
  const result = await auditedDb.query(query, params, 'calls');
  const calls = result.rows;

  // Get total count for pagination
  let countQuery = `SELECT COUNT(*) as total FROM calls c WHERE 1=1`;
  const countParams: any[] = [];
  let countParamIndex = 1;

  if (requestedClientId) {
    countQuery += ` AND c.client_id = $${countParamIndex++}`;
    countParams.push(requestedClientId);
  } else if (user.role === 'sales') {
    countQuery += ` AND c.client_id = $${countParamIndex++}`;
    countParams.push(user.clientId);
  }

  if (userId) {
    countQuery += ` AND c.user_id = $${countParamIndex++}`;
    countParams.push(userId);
  } else if (user.role === 'sales') {
    countQuery += ` AND c.user_id = $${countParamIndex++}`;
    countParams.push(user.id);
  }

  if (dateFrom) {
    countQuery += ` AND c.created_at >= $${countParamIndex++}`;
    countParams.push(dateFrom);
  }
  
  if (dateTo) {
    countQuery += ` AND c.created_at <= $${countParamIndex++}`;
    countParams.push(dateTo);
  }

  const countResult = await auditedDb.query(countQuery, countParams, 'calls');
  const total = parseInt(countResult.rows[0].total, 10);

  return NextResponse.json({
    success: true,
    data: calls,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  });
}));

// POST /api/calls - Create a new call with audit logging
const createCall = withErrorHandling(withAudit(async (request: NextRequest, user: User) => {
  const body = await request.json();

  // Validate request data
  const validation = await validateCreateCall(body);
  if (!validation.isValid) {
    throw createValidationError('Invalid call data', validation.errors);
  }

  const callData = validation.data!;

  // Validate client access
  if (!canAccessClient(user, callData.clientId)) {
    throw createAuthorizationError('Access denied to create call for this client');
  }

  // Create audited database service
  const auditedDb = createAuditedDatabase(request, user);

  // Insert call with audit logging
  const newCall = await auditedDb.insert('calls', {
    client_id: callData.clientId,
    user_id: user.role === 'sales' ? user.id : callData.userId,
    prospect_name: callData.prospectName,
    prospect_phone: callData.prospectPhone,
    call_duration: callData.callDuration,
    outcome: callData.outcome,
    notes: callData.notes,
    created_at: new Date(),
    updated_at: new Date()
  });

  return NextResponse.json({
    success: true,
    data: newCall
  }, { status: 201 });
}));

// Helper function to check client access
function canAccessClient(user: User, clientId: string): boolean {
  if (user.role === 'ceo') {
    return true; // CEO can access all clients
  }
  
  if (user.role === 'admin' || user.role === 'sales') {
    return user.clientId === clientId; // Admin and sales can only access their own client
  }
  
  return false;
}

export const GET = withAuth(getCalls);
export const POST = withAuth(createCall);
