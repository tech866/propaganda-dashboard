# Propaganda Dashboard

A modern, full-stack dashboard application for managing sales calls, client relationships, and business analytics. Built with Next.js, Supabase, and Clerk authentication.

## 🚀 Features

- **Modern Dashboard**: Clean, responsive UI with dark theme and glassmorphism effects
- **Call Management**: Track and manage sales calls with detailed analytics and enhanced logging
- **Client Management**: Comprehensive client relationship management with workspace isolation
- **User Management**: Role-based access control (CEO, Admin, Sales) with multi-tenant support
- **Analytics & Reporting**: Advanced metrics, performance tracking, and financial reporting
- **Real-time Updates**: Live data synchronization with Supabase
- **Secure Authentication**: Clerk-based authentication with JWT integration
- **Row Level Security**: Database-level security with Supabase RLS
- **Testing Suite**: Comprehensive testing tools for responsive design, accessibility, and performance
- **Financial Management**: Advanced financial tracking and reporting capabilities
- **Campaign Management**: Campaign tracking and performance analytics
- **Integration Ready**: Meta Marketing API integration for ad spend tracking
- **Admin Tools**: Complete admin management interface for users and system configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase PostgreSQL with RLS
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Clerk account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd propaganda-dashboard
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in your project root with the following variables:

```env
# =============================================================================
# SUPABASE CONFIGURATION (Required)
# =============================================================================
# Get these from your Supabase project dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# CLERK AUTHENTICATION (Required)
# =============================================================================
# Get these from your Clerk dashboard → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# =============================================================================
# META MARKETING API (Optional)
# =============================================================================
# Get these from your Meta Developer App → Settings → Basic
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
META_REDIRECT_URI=http://localhost:3000/api/meta/auth

# =============================================================================
# NEXTAUTH CONFIGURATION (Required)
# =============================================================================
# Used for session management and JWT handling
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_character_secret_key_here

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=development
PORT=3000

# =============================================================================
# DEVELOPMENT FLAGS (Optional)
# =============================================================================
# Enable debug routes and test data
ENABLE_DEBUG_ROUTES=true
ENABLE_TEST_DATA=true
```

#### How to Get Your Credentials

**Supabase Credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → Settings → API
3. Copy Project URL, anon public key, and service_role key

**Clerk Credentials:**
1. Go to [Clerk Dashboard](https://clerk.com/dashboard)
2. Select your application → API Keys
3. Copy Publishable Key and Secret Key

**Meta Marketing API (Optional):**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new Business app
3. Add Marketing API product
4. Get App ID and App Secret from Settings → Basic

### 4. Database Setup

#### Option A: Use Existing Supabase Project
If you already have a Supabase project with the schema:

1. Run the database verification:
```bash
npm run verify-import
```

2. Test the connection:
```bash
npm run test-supabase
```

#### Option B: Set Up New Supabase Project
If you need to set up a new Supabase project:

1. Create a new project in [Supabase Dashboard](https://supabase.com/dashboard)
2. Run the schema setup script in Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of supabase_schema_setup_fixed.sql
   ```
3. Import your data (if you have existing data):
   ```bash
   npm run export-data  # Export from existing database
   # Then import the generated SQL file in Supabase
   ```

### 5. Verify Setup

Test your configuration with the built-in verification scripts:

```bash
# Test Supabase connection
npm run test-supabase

# Test database operations
npm run test-database-operations

# Test API routes
npm run test-api-routes
```

### 6. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

> **Note**: If port 3000 is already in use, Next.js will automatically use the next available port (e.g., 3001, 3002, etc.). Check the terminal output for the actual URL.

### 7. Access Testing Suite

Once the application is running, you can access the comprehensive testing suite at:
- `/testing` - Testing dashboard
- `/testing/responsive` - Responsive design testing
- `/testing/accessibility` - Accessibility testing
- `/testing/performance` - Performance testing

> **Note**: Replace the base URL with your actual development server URL (e.g., `http://localhost:3003` if port 3000 is in use).

## 🗄️ Database Schema

The application uses the following main tables:

- **users**: User accounts with role-based access
- **clients**: Client companies and organizations  
- **calls**: Sales call records with detailed tracking
- **audit_logs**: System audit trail (optional)

### Key Features:
- **Row Level Security (RLS)**: Automatic data filtering based on user roles
- **Foreign Key Constraints**: Maintains data integrity
- **Audit Logging**: Tracks all data changes
- **Enhanced Call Tracking**: Detailed call outcome and payment tracking

## 🔐 Authentication & Security

### Clerk Integration
- **User Management**: Handled by Clerk
- **Role-Based Access**: CEO, Admin, Sales roles
- **JWT Integration**: Secure token-based authentication with Supabase

### Row Level Security (RLS)
- **Database-Level Security**: Data access controlled at the database level
- **Automatic Filtering**: Users only see data they're authorized to access
- **Client Isolation**: Multi-tenant security for client data

### Access Control Matrix:
| Role | Users | Clients | Calls | Notes |
|------|-------|---------|-------|-------|
| **CEO** | All | All | All | Full access to everything |
| **Admin** | Own Client | Own Client | Own Client | Limited to their client |
| **Sales** | Own Client | Own Client | Own Client | Limited to their client |

## 🧪 Testing

The project includes comprehensive testing capabilities:

### Automated Testing Scripts
```bash
# Test database operations
npm run test-database-operations

# Test service layer integration
npm run test-service-layer

# Test API routes
npm run test-api-routes

# Test RLS policies
npm run test-rls

# Test Supabase connection
npm run test-supabase

# Run all tests
npm run test:all
```

### Built-in Testing Suite
The application includes a comprehensive testing dashboard accessible at `/testing`:

- **Responsive Design Testing** (`/testing/responsive`): Test UI responsiveness across devices
- **Accessibility Testing** (`/testing/accessibility`): WCAG AA compliance testing
- **Performance Testing** (`/testing/performance`): UI performance and loading metrics
- **Cross-Browser Testing** (`/testing/cross-browser`): Browser compatibility testing

### Testing Features
- Real-time viewport testing
- Keyboard navigation validation
- Screen reader compatibility
- Color contrast analysis
- Performance metrics monitoring
- Bundle size analysis
- Network performance testing

## 📊 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:all     # Run all tests

# Database
npm run export-data  # Export data from database
npm run verify-import # Verify data import
npm run test-supabase # Test Supabase connection

# Service Layer
npm run test-database-operations # Test all database operations
npm run test-service-layer      # Test service layer integration
npm run test-api-routes         # Test API endpoints
npm run test-rls               # Test RLS policies
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on every push to main branch

### Environment Variables for Production:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_publishable_key
CLERK_SECRET_KEY=your_production_clerk_secret_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret
NODE_ENV=production
```

## 📁 Project Structure

```
propaganda-dashboard/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── calls/          # Call management
│   │   ├── clients/        # Client management
│   │   ├── admin/          # Admin tools
│   │   ├── analytics/      # Analytics and reporting
│   │   ├── performance/    # Performance metrics
│   │   ├── financial/      # Financial management
│   │   ├── campaigns/      # Campaign tracking
│   │   ├── integrations/   # Third-party integrations
│   │   ├── testing/        # Testing suite
│   │   └── api/            # API routes
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and services
│   ├── middleware/          # Authentication middleware
│   └── migrations/          # Database migration files
├── scripts/                 # Utility and test scripts
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🎯 Available Pages & Features

### Core Dashboard
- **Dashboard** (`/dashboard`): Main analytics dashboard with key metrics
- **Call Logs** (`/calls`): Comprehensive call tracking and management
- **Enhanced Call Logging** (`/calls/enhanced`): Advanced call logging with detailed fields
- **Client Management** (`/clients`): Client workspace and relationship management

### Analytics & Reporting
- **Performance** (`/performance`): Advanced performance analytics
- **Analytics** (`/analytics`): Detailed analytics and reporting
- **Financial** (`/financial`): Financial management and reporting
- **Campaigns** (`/campaigns`): Campaign tracking and performance

### Administration
- **Admin Dashboard** (`/admin`): System administration interface
- **User Management** (`/admin/users`): User creation and management
- **Settings** (`/settings`): Application settings and preferences

### Integrations & Testing
- **Integrations** (`/integrations`): Third-party service integrations
- **Testing Suite** (`/testing`): Comprehensive testing tools
  - Responsive Design Testing
  - Accessibility Testing
  - Performance Testing
  - Cross-Browser Testing

## 🔧 Configuration

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key | `pk_test_abc123...` |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key | `sk_test_abc123...` |
| `NEXTAUTH_URL` | ✅ | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | ✅ | NextAuth secret (32+ chars) | `your-secret-key-here` |
| `NODE_ENV` | ✅ | Environment mode | `development` or `production` |
| `PORT` | ❌ | Server port (default: 3000) | `3000` |
| `META_APP_ID` | ❌ | Meta Marketing API App ID | `1234567890123456` |
| `META_APP_SECRET` | ❌ | Meta Marketing API App Secret | `abc123def456...` |
| `META_REDIRECT_URI` | ❌ | Meta OAuth redirect URI | `http://localhost:3000/api/meta/auth` |
| `ENABLE_DEBUG_ROUTES` | ❌ | Enable debug endpoints | `true` or `false` |
| `ENABLE_TEST_DATA` | ❌ | Enable test data generation | `true` or `false` |

### Supabase Configuration
- **Project URL**: Your Supabase project URL
- **Anon Key**: Public key for client-side operations
- **Service Role Key**: Secret key for server-side operations (bypasses RLS)

### Clerk Configuration
- **Publishable Key**: Public key for client-side authentication
- **Secret Key**: Secret key for server-side operations
- **JWT Template**: Configure JWT template for Supabase integration

### Security Notes
- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - keep it secure
- The `CLERK_SECRET_KEY` has admin privileges - keep it secure
- Use different keys for development and production
- Configure JWT template in Clerk for Row Level Security

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference with examples
- [Supabase Migration Guide](SUPABASE_MIGRATION_SUMMARY.md)
- [Environment Setup](ENVIRONMENT_SETUP.md)
- [Clerk Setup Guide](CLERK_SETUP_GUIDE.md)
- [Database Schema](scripts/README.md)
- [RLS Configuration](scripts/clerk-jwt-configuration-guide.md)
- [Meta API Setup](META_API_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [documentation](docs/)
2. Run the test scripts to identify issues
3. Review the [troubleshooting guide](scripts/README.md)
4. Open an issue on GitHub

## 🎯 Roadmap

### Completed Features ✅
- [x] Modern dark theme UI with glassmorphism effects
- [x] Comprehensive call logging and management
- [x] Client workspace management
- [x] Role-based access control (RBAC)
- [x] Advanced analytics dashboard
- [x] Financial management and reporting
- [x] Campaign tracking
- [x] Supabase migration with RLS
- [x] Clerk authentication integration
- [x] Comprehensive testing suite
- [x] Admin management interface
- [x] Enhanced call logging form

### In Progress 🚧
- [ ] Meta Marketing API integration
- [ ] Settings page implementation

### Planned Features 📋
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Advanced reporting features
- [ ] Webhook integrations
- [ ] Advanced user preferences

---

**Built with ❤️ using Next.js, Supabase, and Clerk**# Deployment trigger - Mon Oct  6 10:16:18 EDT 2025
