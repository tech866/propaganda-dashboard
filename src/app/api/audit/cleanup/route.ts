/**
 * Audit Logs Cleanup API Endpoint
 * DELETE /api/audit/cleanup - Clean up old audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { AuditService } from '@/lib/services/auditService';

// DELETE /api/audit/cleanup - Clean up old audit logs
const cleanupAuditLogs = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);

  const retentionDays = searchParams.get('retentionDays') ? 
    parseInt(searchParams.get('retentionDays')!) : 365;

  // Validate retention days
  if (retentionDays < 30 || retentionDays > 2555) { // Max ~7 years
    return NextResponse.json(
      { success: false, error: 'Retention days must be between 30 and 2555' },
      { status: 400 }
    );
  }

  const deletedCount = await AuditService.cleanupOldLogs(retentionDays);

  return NextResponse.json(
    {
      success: true,
      message: `Successfully cleaned up ${deletedCount} old audit logs`,
      deletedCount
    },
    { status: 200 }
  );
});

// Only CEO role can clean up audit logs
export const DELETE = withAuth(withRole(['ceo'])(cleanupAuditLogs));
