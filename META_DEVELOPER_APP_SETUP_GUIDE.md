# Meta Developer App Setup Guide
## Propaganda Dashboard - Meta Ads Integration

### 🚀 Quick Setup (5 Minutes)

Follow these steps to complete your Meta Ads integration:

### Step 1: Create Meta Developer App

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Sign in with your Facebook business account

2. **Create New App**
   - Click "My Apps" → "Create App"
   - Select "Business" as the app type
   - App Name: `Propaganda Dashboard`
   - App Contact Email: [Your email]
   - Business Account: [Select your business account]
   - Click "Create App"

### Step 2: Configure App Settings

1. **Basic Settings**
   - Go to "Settings" → "Basic"
   - **Copy your App ID** (you'll need this)
   - **Copy your App Secret** (you'll need this)
   - Add App Domains:
     - `propaganda-dashboard.vercel.app`
     - `localhost:3001`

2. **Add Marketing API**
   - Go to "Add Products"
   - Find "Marketing API" and click "Set Up"

3. **Configure OAuth**
   - Go to "Products" → "Facebook Login" → "Settings"
   - Enable "Client OAuth Login"
   - Add Valid OAuth Redirect URIs:
     - `http://localhost:3001/api/meta/auth` (development)
     - `https://propaganda-dashboard.vercel.app/api/meta/auth` (production)

### Step 3: Request Permissions

1. **Go to App Review**
   - Navigate to "App Review" → "Permissions and Features"
   - Request these permissions:
     - `ads_read` - Read ad account data
     - `ads_management` - Manage ads and campaigns
     - `business_management` - Access business assets

2. **Provide Justification**
   - For each permission, explain that this is for a client dashboard to view their own ad spend data
   - Mention it's for business analytics and reporting

### Step 4: Update Environment Variables

1. **Open your `.env.local` file**
2. **Replace the placeholder values:**

```env
# Meta Marketing API Configuration
META_APP_ID=your_actual_app_id_here
META_APP_SECRET=your_actual_app_secret_here
META_REDIRECT_URI=http://localhost:3001/api/meta/auth
```

### Step 5: Run Database Migration

The `meta_tokens` table migration is already created. You need to run it in your Supabase SQL Editor:

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the contents of `src/migrations/add_meta_tokens_table.sql`**
5. **Run the query**

### Step 6: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the integrations page:**
   - Go to: http://localhost:3001/integrations
   - Look for the Meta Integration card

3. **Test the connection:**
   - Click "Connect Meta Account"
   - Complete the OAuth flow
   - Verify you can see your ad accounts

### 🎯 What You'll Get

Once set up, your Meta Ads integration will provide:

- ✅ **OAuth Authentication** - Secure connection to Meta accounts
- ✅ **Ad Spend Data** - Real-time ad spend and performance metrics
- ✅ **Campaign Analytics** - Campaign performance data
- ✅ **Multi-Account Support** - Connect multiple ad accounts
- ✅ **Automatic Sync** - Regular data updates
- ✅ **Beautiful Charts** - Visual representation of ad performance
- ✅ **Client Isolation** - Each client sees only their data

### 🔧 Troubleshooting

**Common Issues:**

1. **"App not found" error**
   - Verify your App ID and Secret are correct
   - Check that the app is published (not in development mode)

2. **"Invalid redirect URI" error**
   - Ensure the redirect URI in your app matches exactly
   - Check for trailing slashes or HTTP vs HTTPS

3. **"Insufficient permissions" error**
   - Make sure you've requested the required permissions
   - Some permissions may require app review

4. **"Token expired" error**
   - The integration handles token refresh automatically
   - If issues persist, disconnect and reconnect

### 📞 Support

If you encounter issues:

1. **Check the logs** in your browser console
2. **Verify environment variables** are set correctly
3. **Test the API endpoints** directly
4. **Check Meta Developer Console** for app status

### 🚀 Production Deployment

For production deployment:

1. **Update redirect URI** to your production domain
2. **Submit app for review** if using restricted permissions
3. **Update environment variables** in Vercel
4. **Test the production integration**

---

**Ready to connect your Meta Ads account? Follow the steps above and you'll have a fully functional integration in minutes!**

