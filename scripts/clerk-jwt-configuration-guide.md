# Clerk JWT Configuration Guide for Supabase RLS

## 🔐 **Production-Grade Security Setup**

This guide walks you through configuring Clerk JWT verification in Supabase for Row Level Security (RLS).

## 📋 **Prerequisites**

1. **Clerk Dashboard Access**: You need admin access to your Clerk project
2. **Supabase Dashboard Access**: You need admin access to your Supabase project
3. **JWT Secret**: You'll need to create a JWT template in Clerk

## 🚀 **Step-by-Step Configuration**

### **Step 1: Create JWT Template in Clerk**

1. **Go to Clerk Dashboard** → Your Project → **JWT Templates**
2. **Click "New template"**
3. **Configure the template:**
   ```json
   {
     "aud": "authenticated",
     "exp": "{{exp}}",
     "iat": "{{iat}}",
     "iss": "https://your-clerk-domain.clerk.accounts.dev",
     "sub": "{{user.id}}",
     "user_id": "{{user.id}}",
     "role": "{{user.public_metadata.role}}",
     "client_id": "{{user.public_metadata.client_id}}",
     "email": "{{user.primary_email_address.email_address}}",
     "name": "{{user.first_name}} {{user.last_name}}"
   }
   ```
4. **Copy the JWT Secret** (you'll need this for Supabase)

### **Step 2: Configure Supabase JWT Settings**

1. **Go to Supabase Dashboard** → Your Project → **Settings** → **API**
2. **Scroll to "JWT Settings"**
3. **Update the following:**
   - **JWT Secret**: Paste the JWT secret from Clerk
   - **JWT URL**: `https://your-clerk-domain.clerk.accounts.dev`
   - **JWT Issuer**: `https://your-clerk-domain.clerk.accounts.dev`

### **Step 3: Update User Metadata in Clerk**

For each user in Clerk, add the following to their **Public Metadata**:
```json
{
  "role": "ceo|admin|sales",
  "client_id": "uuid-of-client"
}
```

### **Step 4: Run the RLS Configuration Script**

Execute the SQL script in Supabase SQL Editor:
```bash
# Run this in Supabase SQL Editor
scripts/configure-clerk-jwt-verification.sql
```

## 🔧 **Application Code Updates**

### **Update Supabase Client Configuration**

Create a new client configuration that uses the anon key for RLS:

```typescript
// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

export function createSupabaseClient() {
  const { getToken } = useAuth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' });
          return {
            Authorization: token ? `Bearer ${token}` : '',
          };
        },
      },
    }
  );
}
```

### **Update API Routes for RLS**

Modify your API routes to use the anon key instead of service role:

```typescript
// src/app/api/users/route.ts
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { getToken } = auth();
  const token = await getToken({ template: 'supabase' });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    }
  );
  
  // Now RLS policies will automatically apply
  const { data, error } = await supabase
    .from('users')
    .select('*');
    
  // RLS will automatically filter based on user's role and client_id
}
```

## 🧪 **Testing RLS Policies**

### **Test Script**

Create a test script to verify RLS is working:

```typescript
// scripts/test-rls-policies.js
import { createClient } from '@supabase/supabase-js';

async function testRLS() {
  // Test with different user tokens
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
    }
  );
  
  // Test data access
  const { data: users } = await supabase.from('users').select('*');
  console.log('Users accessible:', users.length);
  
  // Test cross-client access (should be blocked)
  const { data: allClients } = await supabase.from('clients').select('*');
  console.log('Clients accessible:', allClients.length);
}
```

## 🔒 **Security Benefits**

### **What RLS Provides:**

1. **Database-Level Security**: Even if application code is compromised, data is protected
2. **Automatic Filtering**: Users can only see data they're authorized to access
3. **Role-Based Access**: Different roles have different levels of access
4. **Client Isolation**: Users can only access their own client's data

### **Access Control Matrix:**

| Role | Users | Clients | Calls | Notes |
|------|-------|---------|-------|-------|
| **CEO** | All | All | All | Full access to everything |
| **Admin** | Own Client | Own Client | Own Client | Limited to their client |
| **Sales** | Own Client | Own Client | Own Client | Limited to their client |

## 🚨 **Important Security Notes**

### **Production Checklist:**

- [ ] JWT secret is properly configured in Supabase
- [ ] All users have correct role and client_id in metadata
- [ ] RLS policies are tested with different user roles
- [ ] Service role key is only used for admin operations
- [ ] Client-side operations use anon key with JWT
- [ ] Regular security audits are performed

### **Monitoring:**

- Monitor failed RLS policy violations
- Log unauthorized access attempts
- Regular review of user permissions
- Audit trail of data access

## 🔄 **Migration Strategy**

### **Phase 1: Setup (Current)**
- Configure JWT verification
- Create RLS policies
- Test with development data

### **Phase 2: Gradual Rollout**
- Update API routes to use anon key
- Test with real user data
- Monitor for issues

### **Phase 3: Full Production**
- All operations use RLS
- Service role only for admin operations
- Comprehensive monitoring

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **JWT Verification Fails**
   - Check JWT secret in Supabase
   - Verify JWT template in Clerk
   - Check token format

2. **RLS Policies Not Working**
   - Verify policies are enabled
   - Check user metadata in Clerk
   - Test with different user roles

3. **Data Access Issues**
   - Check user's client_id
   - Verify role permissions
   - Review policy definitions

### **Debug Commands:**

```sql
-- Check current user info
SELECT * FROM auth.current_user_info();

-- List all RLS policies
SELECT * FROM test_rls_policies();

-- Check JWT claims
SELECT current_setting('request.jwt.claims', true)::json;
```

## 🎯 **Result**

Once configured, you'll have:
- ✅ **Database-level security** with RLS
- ✅ **Automatic data filtering** based on user roles
- ✅ **Client isolation** for multi-tenant security
- ✅ **Production-ready security** for your application

**This setup provides enterprise-grade security for your production application!** 🚀
