# Email Configuration Guide

## Overview

The Propaganda Dashboard uses Nodemailer for sending workspace invitation emails. This guide explains how to configure email settings for different providers.

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=noreply@yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Email Provider Setup

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Configure Environment Variables**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_character_app_password
   SMTP_FROM=your_email@gmail.com
   ```

### Outlook/Hotmail Setup

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
SMTP_FROM=your_email@outlook.com
```

### Custom SMTP Server

```bash
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM=noreply@yourdomain.com
```

### SendGrid Setup

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com
```

### Mailgun Setup

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_mailgun_smtp_username
SMTP_PASS=your_mailgun_smtp_password
SMTP_FROM=noreply@yourdomain.com
```

## Testing Email Configuration

You can test your email configuration by running:

```javascript
import { EmailService } from '@/lib/services/emailService';

// Test configuration
const isValid = await EmailService.testEmailConfiguration();
console.log('Email configuration valid:', isValid);
```

## Email Templates

The system includes two email templates:

### 1. Invitation Email
- Sent when inviting users to a workspace
- Includes workspace name, inviter name, role, and invitation link
- Expires after 7 days by default

### 2. Welcome Email
- Sent after a user accepts an invitation
- Includes workspace name and role confirmation
- Provides link to access the workspace

## Customizing Email Templates

Email templates are defined in `src/lib/services/emailService.ts`. You can customize:

- **HTML Templates**: Modify the `generateInvitationEmailHTML()` and `generateWelcomeEmailHTML()` methods
- **Text Templates**: Modify the `generateInvitationEmailText()` and `generateWelcomeEmailText()` methods
- **Styling**: Update the CSS within the HTML templates
- **Content**: Change the email content and messaging

## Security Considerations

1. **App Passwords**: Use app-specific passwords instead of your main account password
2. **Environment Variables**: Never commit email credentials to version control
3. **Rate Limiting**: Consider implementing rate limiting for invitation emails
4. **Token Expiry**: Invitation tokens expire after 7 days by default
5. **Email Validation**: The system validates email addresses before sending

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your SMTP credentials
   - Check if 2FA is enabled and app password is used
   - Ensure the email provider allows SMTP access

2. **Connection Timeout**
   - Check your network connection
   - Verify SMTP host and port settings
   - Check firewall settings

3. **Emails Not Received**
   - Check spam/junk folders
   - Verify the sender email address
   - Check email provider's sending limits

4. **Template Rendering Issues**
   - Verify HTML template syntax
   - Check for missing variables in templates
   - Test with simple text emails first

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will log detailed email sending information to the console.

## Production Considerations

1. **Email Service Provider**: Consider using a dedicated email service like SendGrid, Mailgun, or AWS SES for production
2. **Monitoring**: Implement email delivery monitoring and bounce handling
3. **Compliance**: Ensure compliance with email regulations (CAN-SPAM, GDPR)
4. **Backup**: Have a fallback email service configured
5. **Rate Limiting**: Implement rate limiting to prevent abuse

## Example Usage

```typescript
import { WorkspaceService } from '@/lib/services/workspaceService';

// Invite a user (automatically sends email)
const token = await WorkspaceService.inviteUser(
  workspaceId,
  {
    email: 'user@example.com',
    role: 'sales_rep',
    expires_in_hours: 168 // 7 days
  },
  currentUserId
);

// Accept invitation (automatically sends welcome email)
const result = await WorkspaceService.acceptInvitation(token, userId);
```
