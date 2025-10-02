# Clerk Authentication Vercel Setup Guide

## Overview
This guide will help you fix the Clerk authentication loading screen issue on your Vercel deployment.

## Environment Variables Setup

### 1. Vercel Environment Variables
Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
CLERK_SECRET_KEY=sk_test_... (or sk_live_...)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 2. Get Your Clerk Keys
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "API Keys" section
4. Copy the Publishable Key and Secret Key

## Domain Verification

### 1. Add Your Vercel Domain to Clerk
1. In Clerk Dashboard, go to "Domains"
2. Add your Vercel domain: `propaganda-dashboard-6jfoqki8d-propaganda-incs-projects.vercel.app`
3. Verify the domain (Clerk will provide verification instructions)

### 2. Configure Allowed Origins
1. In Clerk Dashboard, go to "Settings" → "Sessions"
2. Add your Vercel domain to "Allowed Origins"
3. Add your local development domain if needed

## Code Changes Made

### 1. Middleware Fixes (`src/middleware.ts`)
- Removed development mode bypass that was causing production issues
- Added proper public route handling
- Enhanced redirect logic with redirect URL parameter

### 2. Clerk Provider Enhancements (`src/components/providers/ClerkProvider.tsx`)
- Better environment variable validation
- Enhanced error logging
- Added appearance configuration for consistent styling

### 3. Role Context Improvements (`src/contexts/RoleContext.tsx`)
- Reduced timeout from 10 seconds to 5 seconds
- Better error handling and logging
- Improved fallback user logic

## Testing Steps

### 1. Deploy to Vercel
```bash
git add .
git commit -m "Fix Clerk authentication loading screen issue"
git push
```

### 2. Verify Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure all required variables are set
3. Redeploy if you added new variables

### 3. Test Authentication Flow
1. Visit your Vercel URL: `https://propaganda-dashboard-6jfoqki8d-propaganda-incs-projects.vercel.app/`
2. Click "Sign In"
3. Try to authenticate with a test user
4. Check browser console for any errors

## Troubleshooting

### Common Issues

#### 1. "Clerk not properly configured" Error
- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- Ensure the key starts with `pk_test_` or `pk_live_`
- Verify the key is not a placeholder value

#### 2. Infinite Loading Screen
- Check browser console for JavaScript errors
- Verify domain is added to Clerk dashboard
- Ensure environment variables are set in Vercel

#### 3. Redirect Loops
- Check that public routes are properly configured in middleware
- Verify sign-in and sign-up URLs are correct
- Ensure after-sign-in URL is set correctly

### Debug Steps
1. Open browser developer tools
2. Check Console tab for error messages
3. Check Network tab for failed requests
4. Look for Clerk-related errors in the console

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Domain verified in Clerk dashboard
- [ ] Allowed origins configured in Clerk
- [ ] Test authentication flow works
- [ ] No console errors during authentication
- [ ] Users can successfully log in and access dashboard

## Support

If you continue to experience issues:
1. Check the browser console for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your Clerk application is properly configured
4. Test with a fresh browser session (incognito mode)

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
