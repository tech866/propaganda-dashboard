/**
 * Email Service
 * Handles sending emails using Resend API
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InvitationEmailData {
  inviteeEmail: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationUrl: string;
  expiresAt: Date;
}

export interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  workspaceName: string;
  loginUrl: string;
}

export class EmailService {
  /**
   * Send team invitation email
   */
  static async sendTeamInvitation(data: InvitationEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      const { data: emailData, error } = await resend.emails.send({
        from: 'Propaganda Dashboard <noreply@propaganda-dashboard.com>',
        to: [data.inviteeEmail],
        subject: `You're invited to join ${data.workspaceName} on Propaganda Dashboard`,
        html: this.generateInvitationEmailHTML(data),
        text: this.generateInvitationEmailText(data),
      });

      if (error) {
        console.error('Resend API error:', error);
        return { success: false, error: error.message };
      }

      console.log('Team invitation email sent successfully:', emailData);
      return { success: true, messageId: emailData?.id };
    } catch (error) {
      console.error('Error sending team invitation email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      const { data: emailData, error } = await resend.emails.send({
        from: 'Propaganda Dashboard <noreply@propaganda-dashboard.com>',
        to: [data.userEmail],
        subject: `Welcome to ${data.workspaceName} on Propaganda Dashboard`,
        html: this.generateWelcomeEmailHTML(data),
        text: this.generateWelcomeEmailText(data),
      });

      if (error) {
        console.error('Resend API error:', error);
        return { success: false, error: error.message };
      }

      console.log('Welcome email sent successfully:', emailData);
      return { success: true, messageId: emailData?.id };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generate HTML for invitation email
   */
  private static generateInvitationEmailHTML(data: InvitationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: #5a6fd8; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .role-badge { background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>You're Invited!</h1>
            <p>Join ${data.workspaceName} on Propaganda Dashboard</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.workspaceName}</strong> on Propaganda Dashboard.</p>
            
            <p>Your role: <span class="role-badge">${data.role}</span></p>
            
            <p>Propaganda Dashboard is a powerful CRM and analytics platform that helps teams track sales performance, manage leads, and analyze business metrics.</p>
            
            <div style="text-align: center;">
              <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
            </div>
            
            <p><strong>This invitation expires on:</strong> ${data.expiresAt.toLocaleDateString()} at ${data.expiresAt.toLocaleTimeString()}</p>
            
            <p>If you have any questions, feel free to reach out to ${data.inviterName} or our support team.</p>
          </div>
          <div class="footer">
            <p>This invitation was sent by Propaganda Dashboard</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate text version of invitation email
   */
  private static generateInvitationEmailText(data: InvitationEmailData): string {
    return `
You're Invited to Join ${data.workspaceName}!

Hello!

${data.inviterName} has invited you to join ${data.workspaceName} on Propaganda Dashboard.

Your role: ${data.role}

Propaganda Dashboard is a powerful CRM and analytics platform that helps teams track sales performance, manage leads, and analyze business metrics.

Accept your invitation: ${data.invitationUrl}

This invitation expires on: ${data.expiresAt.toLocaleDateString()} at ${data.expiresAt.toLocaleTimeString()}

If you have any questions, feel free to reach out to ${data.inviterName} or our support team.

---
This invitation was sent by Propaganda Dashboard
If you didn't expect this invitation, you can safely ignore this email.
    `;
  }

  /**
   * Generate HTML for welcome email
   */
  private static generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Propaganda Dashboard</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: #5a6fd8; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Propaganda Dashboard!</h1>
            <p>You're now part of ${data.workspaceName}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>Welcome to <strong>${data.workspaceName}</strong> on Propaganda Dashboard! We're excited to have you on the team.</p>
            
            <p>Here's what you can do with Propaganda Dashboard:</p>
            
            <div class="feature">
              <strong>📊 Analytics Dashboard</strong><br>
              Track sales performance, conversion rates, and key business metrics in real-time.
            </div>
            
            <div class="feature">
              <strong>🎯 CRM Pipeline</strong><br>
              Manage leads and opportunities with our intuitive Kanban-style interface.
            </div>
            
            <div class="feature">
              <strong>📈 Performance Tracking</strong><br>
              Monitor team performance and identify areas for improvement.
            </div>
            
            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Get Started</a>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to your team lead or our support team.</p>
          </div>
          <div class="footer">
            <p>Welcome to Propaganda Dashboard</p>
            <p>Your team collaboration platform</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate text version of welcome email
   */
  private static generateWelcomeEmailText(data: WelcomeEmailData): string {
    return `
Welcome to Propaganda Dashboard!

Hello ${data.userName}!

Welcome to ${data.workspaceName} on Propaganda Dashboard! We're excited to have you on the team.

Here's what you can do with Propaganda Dashboard:

📊 Analytics Dashboard
Track sales performance, conversion rates, and key business metrics in real-time.

🎯 CRM Pipeline
Manage leads and opportunities with our intuitive Kanban-style interface.

📈 Performance Tracking
Monitor team performance and identify areas for improvement.

Get started: ${data.loginUrl}

If you have any questions or need help getting started, don't hesitate to reach out to your team lead or our support team.

---
Welcome to Propaganda Dashboard
Your team collaboration platform
    `;
  }
}