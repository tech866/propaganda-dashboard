// =====================================================
// Email Service for Workspace Invitations
// Task 20.3: Secure Email Invitation System
// =====================================================

import nodemailer from 'nodemailer';
import { WorkspaceService } from './workspaceService';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface InvitationEmailData {
  workspaceName: string;
  inviterName: string;
  role: string;
  invitationLink: string;
  expiresAt: string;
  recipientEmail: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      };

      this.transporter = nodemailer.createTransporter(config);
    }

    return this.transporter;
  }

  /**
   * Send workspace invitation email
   */
  static async sendInvitationEmail(
    invitationData: InvitationEmailData
  ): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: {
          name: 'Propaganda Dashboard',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@propaganda-dashboard.com'
        },
        to: invitationData.recipientEmail,
        subject: `You're invited to join ${invitationData.workspaceName} workspace`,
        html: this.generateInvitationEmailHTML(invitationData),
        text: this.generateInvitationEmailText(invitationData)
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Invitation email sent:', result.messageId);
      return true;

    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  }

  /**
   * Generate HTML email template for invitation
   */
  private static generateInvitationEmailHTML(data: InvitationEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Invitation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .workspace-info {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .workspace-name {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .role-badge {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            text-transform: capitalize;
          }
          .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background: #2563eb;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .expiry-notice {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Propaganda Dashboard</div>
            <h1 class="title">You're Invited!</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            <p><strong>${data.inviterName}</strong> has invited you to join their workspace on Propaganda Dashboard.</p>
            
            <div class="workspace-info">
              <div class="workspace-name">${data.workspaceName}</div>
              <div>Role: <span class="role-badge">${data.role.replace('_', ' ')}</span></div>
            </div>
            
            <p>Click the button below to accept the invitation and get started:</p>
            
            <div style="text-align: center;">
              <a href="${data.invitationLink}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="expiry-notice">
              <strong>⏰ This invitation expires on ${data.expiresAt}</strong>
            </div>
            
            <p>If you can't click the button, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${data.invitationLink}</p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent to ${data.recipientEmail}</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>&copy; 2024 Propaganda Dashboard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for invitation
   */
  private static generateInvitationEmailText(data: InvitationEmailData): string {
    return `
      You're Invited to Join ${data.workspaceName}
      
      Hello!
      
      ${data.inviterName} has invited you to join their workspace on Propaganda Dashboard.
      
      Workspace: ${data.workspaceName}
      Role: ${data.role.replace('_', ' ')}
      
      To accept this invitation, click the link below:
      ${data.invitationLink}
      
      This invitation expires on ${data.expiresAt}
      
      If you can't click the link, copy and paste it into your browser.
      
      This invitation was sent to ${data.recipientEmail}
      If you didn't expect this invitation, you can safely ignore this email.
      
      © 2024 Propaganda Dashboard. All rights reserved.
    `;
  }

  /**
   * Send welcome email after invitation acceptance
   */
  static async sendWelcomeEmail(
    userEmail: string,
    workspaceName: string,
    role: string
  ): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: {
          name: 'Propaganda Dashboard',
          address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@propaganda-dashboard.com'
        },
        to: userEmail,
        subject: `Welcome to ${workspaceName}!`,
        html: this.generateWelcomeEmailHTML(workspaceName, role),
        text: this.generateWelcomeEmailText(workspaceName, role)
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return true;

    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Generate HTML welcome email
   */
  private static generateWelcomeEmailHTML(workspaceName: string, role: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${workspaceName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .cta-button {
            display: inline-block;
            background: #10b981;
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background: #059669;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Propaganda Dashboard</div>
            <h1 class="title">Welcome to ${workspaceName}!</h1>
          </div>
          
          <div class="content">
            <p>Congratulations! You've successfully joined the <strong>${workspaceName}</strong> workspace as a <strong>${role.replace('_', ' ')}</strong>.</p>
            
            <p>You can now access your workspace and start collaborating with your team.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspaces" class="cta-button">Go to Workspace</a>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to your workspace administrator.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 Propaganda Dashboard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text welcome email
   */
  private static generateWelcomeEmailText(workspaceName: string, role: string): string {
    return `
      Welcome to ${workspaceName}!
      
      Congratulations! You've successfully joined the ${workspaceName} workspace as a ${role.replace('_', ' ')}.
      
      You can now access your workspace and start collaborating with your team.
      
      Go to your workspace: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workspaces
      
      If you have any questions or need help getting started, don't hesitate to reach out to your workspace administrator.
      
      © 2024 Propaganda Dashboard. All rights reserved.
    `;
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      console.log('Email configuration is valid');
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}
