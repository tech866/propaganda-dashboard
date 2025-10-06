// =====================================================
// Test Email API Endpoint
// Task 20.3: Secure Email Invitation System Testing
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const { testType, email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    let result = false;

    switch (testType) {
      case 'config':
        // Test email configuration
        result = await EmailService.testEmailConfiguration();
        break;

      case 'invitation':
        // Test invitation email
        result = await EmailService.sendInvitationEmail({
          workspaceName: 'Test Workspace',
          inviterName: 'Test User',
          role: 'sales_rep',
          invitationLink: 'https://example.com/invite/test-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          recipientEmail: email
        });
        break;

      case 'welcome':
        // Test welcome email
        result = await EmailService.sendWelcomeEmail(
          email,
          'Test Workspace',
          'sales_rep'
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type. Use: config, invitation, or welcome' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message: result 
        ? `${testType} test completed successfully` 
        : `${testType} test failed`,
      testType,
      email
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing configuration only
export async function GET() {
  try {
    const isValid = await EmailService.testEmailConfiguration();
    
    return NextResponse.json({
      success: isValid,
      message: isValid 
        ? 'Email configuration is valid' 
        : 'Email configuration is invalid',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email configuration test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email configuration test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
