---
title: Research Session
query: "How to implement multi-tenant workspace management with team invitations and role-based access control in Next.js applications? Include best practices for database schema design, authentication flows, and email invitation systems."
date: 10/5/2025
time: 12:22:59 PM
timestamp: 2025-10-05T16:22:58.985Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** How to implement multi-tenant workspace management with team invitations and role-based access control in Next.js applications? Include best practices for database schema design, authentication flows, and email invitation systems.

**Response:**

To implement **multi-tenant workspace management** with **team invitations** and **role-based access control (RBAC)** in a Next.js application—especially one using Clerk for authentication and Supabase/PostgreSQL for data—you need to design for tenant isolation, flexible user-role mapping, secure invitation flows, and scalable database schemas. Below is a comprehensive, actionable guide tailored to your project context.

---

## 1. Multi-Tenancy Patterns in Next.js

### Tenant Identification

- **Subdomain Routing**: Each tenant (workspace/org) gets a unique subdomain (e.g., `acme.yourapp.com`). Use Next.js middleware to extract the subdomain and set the current tenant context for all requests[2][4].
- **Path-Based Routing**: Alternatively, use a path segment (e.g., `/org/acme/dashboard`). This is easier to develop and test locally, and works well with client switchers[1].

**Best Practice**: For your project, since you already have a client switcher, path-based routing (e.g., `/clients/[clientId]/...`) is recommended for simplicity and flexibility.

### Middleware Example (Path-Based)
```typescript
// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const clientId = req.nextUrl.pathname.split('/')[2]; // e.g., /clients/[clientId]/...
  // Set clientId in request context or cookies for downstream use
  // Optionally, validate clientId exists and user has access
  return NextResponse.next();
}
```

---

## 2. Database Schema Design for Multi-Tenancy and RBAC

### Core Tables

| Table         | Purpose                                   | Key Columns                                  |
|---------------|-------------------------------------------|----------------------------------------------|
| clients       | Tenant/workspace metadata                 | id (PK), name, created_at, ...               |
| users         | User metadata (from Clerk)                | id (PK), email, clerk_id, ...                |
| client_users  | Memberships (user in workspace)           | id (PK), client_id (FK), user_id (FK), role, status, invited_by, invited_at, joined_at |
| roles         | (Optional) Role definitions               | id (PK), name, permissions (JSONB)           |
| invitations   | Pending invitations                       | id (PK), client_id, email, role, token, status, expires_at, invited_by |

**Notes:**
- Use a **join table** (`client_users`) to allow users to belong to multiple tenants with different roles.
- Store **role** as an enum or FK to a roles table for flexibility.
- Store **status** in `client_users` (active, pending, removed) for invitation and onboarding flows.

### Example SQL (PostgreSQL)
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  clerk_id TEXT UNIQUE NOT NULL
);

CREATE TABLE client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL, -- e.g., 'admin', 'member', 'viewer'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'pending', 'removed'
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP,
  joined_at TIMESTAMP
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  expires_at TIMESTAMP,
  invited_by UUID REFERENCES users(id)
);
```

---

## 3. Authentication and Authorization Flows

### Authentication (Clerk)

- **Clerk** handles user sign-up, login, MFA, and JWT issuance.
- Use Clerk's JWT in API routes to identify the user and fetch their `clerk_id` for DB lookups.

### Authorization (RBAC)

- On each request, determine:
  - **Current tenant** (from path or subdomain)
  - **Current user** (from Clerk JWT)
  - **Role** (from `client_users` for that tenant)
- Enforce permissions at both the API and UI level (e.g., only admins can invite users, only members can view certain data).

**Example: Role Check in API Route**
```typescript
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/src/lib/database';

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  const { clientId } = req.query;

  // Fetch role for this user in this client
  const membership = await db.client_users.findFirst({
    where: { user_id: userId, client_id: clientId, status: 'active' }
  });

  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Proceed with admin-only logic...
}
```

---

## 4. Team Invitation System

### Invitation Flow

1. **Admin invites user**: Enters email and selects role.
2. **System creates invitation**: Generates a secure token, stores in `invitations` table, and sends email.
3. **User receives email**: Clicks link with token (e.g., `/invite/accept?token=...`).
4. **User signs up/logs in**: Clerk handles authentication.
5. **System verifies token**: On acceptance, creates `client_users` record, marks invitation as accepted.

### Email Invitation Example

- Use a transactional email service (e.g., SendGrid, Postmark, Resend).
- Email contains a link: `https://yourapp.com/invite/accept?token=...`
- On link visit:
  - If not authenticated, redirect to Clerk sign-in, then back to invitation page.
  - Validate token, check expiration, and associate user with tenant.

**Example: Invitation Acceptance API**
```typescript
// POST /api/invite/accept
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/src/lib/database';

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  const { token } = req.body;

  const invitation = await db.invitations.findFirst({ where: { token, status: 'pending' } });
  if (!invitation || invitation.expires_at < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired invitation' });
  }

  // Create client_users record
  await db.client_users.create({
    data: {
      client_id: invitation.client_id,
      user_id: userId,
      role: invitation.role,
      status: 'active',
      joined_at: new Date(),
      invited_by: invitation.invited_by,
      invited_at: invitation.invited_at
    }
  });

  // Mark invitation as accepted
  await db.invitations.update({ where: { id: invitation.id }, data: { status: 'accepted' } });

  res.status(200).json({ success: true });
}
```

---

## 5. UI/UX Considerations

- **Client Switcher**: Show only tenants where the user is an active member (`client_users.status = 'active'`).
- **Role-Based UI**: Render admin features (user management, invitations) only for users with the `admin` or `ceo` role.
- **Invitation Status**: Show pending invitations and allow resending/canceling.

---

## 6. Security and Data Isolation

- **Row-Level Security (RLS)**: If using Supabase/Postgres, enforce RLS so users can only access data for tenants they belong to.
- **API Authorization**: Every API route must check both user identity and tenant membership/role.
- **Audit Logging**: Log all membership changes, invitations, and role changes for traceability (already implemented in your project).

---

## 7. Edge Cases and Pitfalls

- **User already exists in tenant**: Prevent duplicate invitations or memberships.
- **Invitation reuse**: Tokens should be single-use and expire after acceptance or a set time.
- **User in multiple tenants**: Always scope actions/data to the current tenant context.
- **Role escalation**: Only allow users with sufficient privileges (e.g., admin) to change roles or invite others.
- **Orphaned tenants**: Prevent tenants with no admins; require at least one admin per tenant.

---

## 8. Example Directory Structure and Integration Points

- **API routes**: `/src/app/api/clients/[clientId]/users`, `/src/app/api/invite`
- **Components**: `/src/components/clients/ClientManagement.tsx`, `/src/components/auth/RoleBasedAccess.tsx`
- **Middleware**: `/src/middleware/auth.ts` for tenant context extraction
- **Database service**: `/src/lib/services/clientService.ts`, `/src/lib/services/userIdentification.ts`

---

## 9. Best Practices Summary

- **Always scope queries and mutations by tenant (client_id) and user role.**
- **Use a join table for user-tenant-role mapping.**
- **Enforce RBAC at both API and UI layers.**
- **Use secure, expiring tokens for invitations.**
- **Leverage Clerk for authentication and session management.**
- **Implement RLS in Supabase/Postgres for defense-in-depth.**
- **Log all membership and role changes for auditing.**
- **Test all flows with users in multiple tenants and with different roles.**

---

### References to Project Context

- Your **Clerk integration** provides robust authentication and user management—use Clerk's user ID as the canonical user identifier in your DB.
- The **client switcher** feature aligns with path-based multi-tenancy.
- **RBAC** is already implemented; extend it to tenant-scoped roles.
- **Audit logging** is in place; ensure it covers invitations and membership changes.
- **Admin screens** should leverage the RBAC and membership tables for user management.

---

**This architecture will provide secure, scalable, and maintainable multi-tenant workspace management with robust team invitations and RBAC, fully leveraging your existing Next.js, Clerk, and Supabase/Postgres stack.**


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-10-05T16:22:58.985Z*
