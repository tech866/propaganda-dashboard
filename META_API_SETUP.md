# Meta Marketing API Integration Setup Guide

This guide will help you set up the Meta Marketing API integration for the Propaganda Dashboard.

## Prerequisites

1. **Meta Developer Account**: You need a Meta Developer account
2. **Facebook Business Account**: A Facebook Business account with ad accounts
3. **Supabase Database**: The database must be set up with the required tables

## Step 1: Create Meta Developer App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in the app details:
   - **App Name**: Propaganda Dashboard
   - **App Contact Email**: Your email
   - **Business Account**: Select your business account

## Step 2: Configure App Settings

### Basic Settings
1. In your app dashboard, go to "Settings" → "Basic"
2. Note down your **App ID** and **App Secret**
3. Add your domain to "App Domains"

### Facebook Login Configuration
1. Go to "Products" → "Facebook Login" → "Settings"
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/meta/auth` (for development)
   - `https://yourdomain.com/api/meta/auth` (for production)

### Marketing API Configuration
1. Go to "Products" → "Marketing API"
2. Add your app to the Marketing API
3. Request the following permissions:
   - `ads_read`
   - `ads_management`
   - `business_management`

## Step 3: Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Meta Marketing API
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_REDIRECT_URI=http://localhost:3000/api/meta/auth
```

For production, update the redirect URI to your production domain.

## Step 4: Database Setup

Run the following SQL migration in your Supabase SQL Editor:

```sql
-- Add Meta tokens table for OAuth token storage
CREATE TABLE IF NOT EXISTS meta_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    access_token TEXT NOT NULL,
    token_type VARCHAR(50) NOT NULL DEFAULT 'long_lived' CHECK (token_type IN ('short_lived', 'long_lived')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT, -- OAuth scopes granted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_meta_tokens_user_id ON meta_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_tokens_expires_at ON meta_tokens(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE meta_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tokens
CREATE POLICY "Users can access their own meta tokens" ON meta_tokens
    FOR ALL USING (user_id = auth.jwt() ->> 'sub');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meta_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meta_tokens_updated_at
    BEFORE UPDATE ON meta_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_meta_tokens_updated_at();
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/integrations` in your application
3. Click "Connect Meta Account" in the Meta Integration card
4. Complete the OAuth flow
5. Verify that your ad accounts appear in the workspace

## API Endpoints

The integration provides the following API endpoints:

### Authentication
- `POST /api/meta/auth` - Generate OAuth URL
- `GET /api/meta/auth` - Handle OAuth callback
- `GET /api/meta/status` - Check connection status
- `POST /api/meta/disconnect` - Disconnect Meta account

### Data
- `GET /api/meta/ad-spend` - Get ad spend data
  - Query parameters: `adAccountId`, `dateStart`, `dateStop`

## Features

### Meta Integration Component
- OAuth authentication flow
- Connection status display
- Ad account listing
- Disconnect functionality

### Meta Client Workspace
- Real-time ad spend data
- Campaign performance metrics
- Date range filtering
- Multi-account support

### Security Features
- Secure token storage in database
- Row-level security (RLS) policies
- Token expiration handling
- Automatic token refresh

## Troubleshooting

### Common Issues

1. **"Meta account not connected"**
   - Ensure the OAuth flow completed successfully
   - Check that the token was stored in the database
   - Verify the user has the required permissions

2. **"Meta token expired"**
   - The token has expired (60-day limit for long-lived tokens)
   - User needs to reconnect their Meta account

3. **"No ad accounts found"**
   - User's Meta account doesn't have ad accounts
   - User doesn't have permission to access ad accounts
   - Check the app permissions in Meta Developer Console

4. **OAuth redirect issues**
   - Verify the redirect URI matches exactly in Meta Developer Console
   - Check that the domain is added to App Domains

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed error messages in the console.

## Production Considerations

1. **Security**
   - Never expose App Secret in client-side code
   - Use HTTPS for all OAuth redirects
   - Implement proper error handling

2. **Rate Limiting**
   - Meta API has rate limits
   - Implement caching for frequently accessed data
   - Consider implementing exponential backoff

3. **Token Management**
   - Monitor token expiration
   - Implement automatic token refresh
   - Handle token revocation gracefully

4. **Data Privacy**
   - Ensure compliance with data protection regulations
   - Implement proper data retention policies
   - Provide users with data deletion options

## Support

For issues with the Meta Marketing API:
- [Meta Marketing API Documentation](https://developers.facebook.com/docs/marketing-api/)
- [Meta Developer Community](https://developers.facebook.com/community/)
- [Meta Business Help Center](https://www.facebook.com/business/help)

For issues with this integration:
- Check the application logs
- Verify environment variables
- Test API endpoints directly