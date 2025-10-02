# Propaganda Dashboard - Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended deployment platform for Next.js applications and provides seamless integration with Supabase and Clerk.

#### Prerequisites
- Vercel account
- GitHub repository
- Supabase project
- Clerk application

#### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Choose the repository: `propaganda-dashboard`

#### Step 2: Configure Environment Variables
In Vercel project settings, add the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key

# Application Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_32_character_secret
NODE_ENV=production
```

#### Step 3: Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy your application
3. Your app will be available at `https://your-project.vercel.app`

#### Step 4: Configure Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

---

### Option 2: Netlify

#### Prerequisites
- Netlify account
- GitHub repository
- Supabase project
- Clerk application

#### Step 1: Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

#### Step 2: Configure Environment Variables
In Netlify site settings, add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
NEXTAUTH_URL=https://your-site.netlify.app
NEXTAUTH_SECRET=your_32_character_secret
NODE_ENV=production
```

#### Step 3: Deploy
1. Click "Deploy site"
2. Netlify will build and deploy your application

---

### Option 3: Railway

#### Prerequisites
- Railway account
- GitHub repository
- Supabase project
- Clerk application

#### Step 1: Connect Repository
1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

#### Step 2: Configure Environment Variables
In Railway project settings, add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your_32_character_secret
NODE_ENV=production
```

#### Step 3: Deploy
1. Railway will automatically detect Next.js and deploy
2. Your app will be available at the provided Railway URL

---

### Option 4: Self-Hosted (VPS/Dedicated Server)

#### Prerequisites
- VPS or dedicated server
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx (optional, for reverse proxy)
- SSL certificate

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install nginx -y
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/propaganda-dashboard.git
cd propaganda-dashboard

# Install dependencies
npm install

# Build application
npm run build

# Create environment file
cp .env.example .env.production
# Edit .env.production with production values
```

#### Step 3: Configure PM2
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'propaganda-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/propaganda-dashboard',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

#### Step 4: Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

#### Step 5: Configure Nginx (Optional)
Create `/etc/nginx/sites-available/propaganda-dashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/propaganda-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 6: SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔧 Production Configuration

### Environment Variables

#### Required Variables
```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key

# Application
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_32_character_production_secret
NODE_ENV=production
```

#### Optional Variables
```env
# Meta Marketing API (if using)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=https://your-domain.com/api/meta/auth

# Analytics (if using)
GOOGLE_ANALYTICS_ID=your_ga_id
MIXPANEL_TOKEN=your_mixpanel_token

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Database Configuration

#### Supabase Production Setup
1. **Create Production Project**: Create a new Supabase project for production
2. **Configure RLS**: Ensure Row Level Security is properly configured
3. **Backup Strategy**: Set up automated backups
4. **Monitoring**: Enable database monitoring and alerts

#### Data Migration
If migrating from development:
1. Export data from development database
2. Import to production database
3. Verify data integrity
4. Test all functionality

### Security Configuration

#### Clerk Production Setup
1. **Production Application**: Create production Clerk application
2. **Domain Configuration**: Add production domain to allowed origins
3. **JWT Template**: Configure JWT template for production
4. **Webhooks**: Set up production webhooks

#### Supabase Security
1. **RLS Policies**: Verify all RLS policies are active
2. **API Keys**: Use production API keys
3. **Database Access**: Restrict database access to application only
4. **Audit Logging**: Enable audit logging for production

---

## 📊 Monitoring & Analytics

### Application Monitoring

#### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      {/* Your app */}
      <Analytics />
    </>
  );
}
```

#### Sentry Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Your existing config
}, {
  // Sentry config
});
```

### Database Monitoring

#### Supabase Monitoring
1. **Database Metrics**: Monitor query performance and usage
2. **Error Tracking**: Set up error alerts
3. **Backup Monitoring**: Verify backup completion
4. **Security Alerts**: Monitor for suspicious activity

### Performance Monitoring

#### Core Web Vitals
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift

#### Custom Metrics
- **API Response Times**: Monitor endpoint performance
- **Database Query Performance**: Track slow queries
- **User Engagement**: Monitor user activity

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:all
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Secrets
Add the following secrets to your GitHub repository:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- All environment variables (prefixed with `NEXT_PUBLIC_` for client-side)

---

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
- **Check Node.js version**: Ensure Node.js 18+ is used
- **Verify dependencies**: Run `npm ci` instead of `npm install`
- **Check environment variables**: Ensure all required variables are set
- **Review build logs**: Check for specific error messages

#### 2. Runtime Errors
- **Database connection**: Verify Supabase credentials
- **Authentication**: Check Clerk configuration
- **Environment variables**: Ensure all variables are properly set
- **CORS issues**: Configure allowed origins in Clerk/Supabase

#### 3. Performance Issues
- **Database queries**: Optimize slow queries
- **Image optimization**: Use Next.js Image component
- **Bundle size**: Analyze bundle with `npm run build`
- **Caching**: Implement proper caching strategies

### Debugging Tools

#### Vercel Debugging
```bash
# Install Vercel CLI
npm install -g vercel

# Debug locally
vercel dev

# View logs
vercel logs
```

#### Database Debugging
```bash
# Test database connection
npm run test-supabase

# Test database operations
npm run test-database-operations
```

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass (`npm run test:all`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in development

### Security
- [ ] Environment variables are secure
- [ ] RLS policies are active
- [ ] Authentication is working
- [ ] API endpoints are protected

### Performance
- [ ] Core Web Vitals are acceptable
- [ ] Database queries are optimized
- [ ] Images are optimized
- [ ] Bundle size is reasonable

### Functionality
- [ ] All features work in production
- [ ] Data migration is complete
- [ ] User roles and permissions work
- [ ] Analytics and reporting function

### Monitoring
- [ ] Error tracking is configured
- [ ] Performance monitoring is active
- [ ] Database monitoring is set up
- [ ] Backup strategy is in place

---

## 🎉 Post-Deployment

### Verification Steps
1. **Test all functionality**: Verify all features work
2. **Check performance**: Monitor Core Web Vitals
3. **Verify security**: Test authentication and authorization
4. **Monitor errors**: Check for any runtime errors
5. **Test data integrity**: Verify all data is accessible

### Maintenance
1. **Regular updates**: Keep dependencies updated
2. **Security patches**: Apply security updates promptly
3. **Performance monitoring**: Monitor and optimize performance
4. **Backup verification**: Regularly verify backups
5. **User feedback**: Monitor user feedback and issues

---

## 📞 Support

### Getting Help
1. **Documentation**: Check all documentation files
2. **GitHub Issues**: Open issues for bugs or feature requests
3. **Community**: Join relevant communities for support
4. **Professional Support**: Consider professional support for critical issues

### Useful Resources
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)

---

**Deployment Status**: ✅ Production Ready  
**Last Updated**: 2024-01-01  
**Supported Platforms**: Vercel, Netlify, Railway, Self-hosted
