---
title: Research Session
query: "How to modify Supabase database schema for multi-tenant workspace management? Include RLS policies, tenant isolation, and migration strategies for existing data."
date: 10/5/2025
time: 12:25:46 PM
timestamp: 2025-10-05T16:25:46.088Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** How to modify Supabase database schema for multi-tenant workspace management? Include RLS policies, tenant isolation, and migration strategies for existing data.

**Response:**

Based on your project's existing multi-tenant architecture with Supabase, here's a comprehensive guide for modifying your database schema to enhance workspace management capabilities while maintaining robust tenant isolation.

## Current Architecture Assessment

Your project already has a solid foundation with a shared database approach using Row Level Security (RLS) for tenant isolation[1]. The existing schema includes client-level data segregation with core tables for clients, users, calls, loss_reasons, and audit_logs. This provides an excellent starting point for implementing enhanced workspace management features.

## Enhanced Multi-Tenant Schema Design

**Workspace-Centric Table Structure**

To strengthen your multi-tenant architecture, consider implementing a hierarchical tenant model where workspaces serve as the primary isolation boundary. Create a dedicated `workspaces` table that acts as the root tenant identifier:

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**User-Workspace Association**

Modify your user management to support workspace membership through a junction table that enables flexible role assignments:

```sql
CREATE TABLE workspace_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);
```

## Comprehensive RLS Policy Implementation

**Workspace-Level Data Isolation**

Implement RLS policies that ensure complete data isolation at the workspace level. For your existing calls table, enhance the policy to include workspace context:

```sql
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access calls from their workspace" ON calls
  FOR ALL USING (
    workspace_id IN (
      SELECT wm.workspace_id 
      FROM workspace_memberships wm 
      WHERE wm.user_id = auth.uid()
    )
  );
```

**Role-Based Access Policies**

Create granular policies that respect both workspace boundaries and user roles within those workspaces[2]:

```sql
CREATE POLICY "Admins can manage all workspace data" ON calls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_memberships wm
      WHERE wm.user_id = auth.uid() 
      AND wm.workspace_id = calls.workspace_id
      AND wm.role = 'admin'
    )
  );
```

## Migration Strategies for Existing Data

**Gradual Migration Approach**

Since your project already has data in production, implement a phased migration strategy that minimizes downtime:

1. **Phase 1: Schema Extension** - Add workspace-related columns to existing tables with default values
2. **Phase 2: Data Population** - Populate workspace associations based on existing client relationships
3. **Phase 3: Policy Migration** - Gradually replace existing RLS policies with workspace-aware versions
4. **Phase 4: Cleanup** - Remove deprecated columns and policies once migration is complete

**Migration Script Example**

```sql
-- Add workspace_id to existing tables
ALTER TABLE calls ADD COLUMN workspace_id UUID;
ALTER TABLE clients ADD COLUMN workspace_id UUID;

-- Populate workspace associations based on existing client data
UPDATE calls SET workspace_id = (
  SELECT c.workspace_id FROM clients c WHERE c.id = calls.client_id
);

-- Make workspace_id required after population
ALTER TABLE calls ALTER COLUMN workspace_id SET NOT NULL;
```

## Advanced Tenant Isolation Features

**Resource Usage Tracking**

Implement workspace-level resource monitoring to support future billing or usage analytics[2]:

```sql
CREATE TABLE workspace_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value BIGINT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Audit Trail Enhancement**

Extend your existing audit logging to include workspace context, ensuring complete traceability across tenant boundaries:

```sql
ALTER TABLE audit_logs ADD COLUMN workspace_id UUID REFERENCES workspaces(id);

CREATE INDEX idx_audit_logs_workspace_time ON audit_logs(workspace_id, created_at);
```

## Integration with Existing Features

**Client Switcher Enhancement**

Your existing client switcher (Task 10) can be enhanced to support workspace-level switching, allowing users with multiple workspace memberships to seamlessly transition between different tenant contexts without compromising data isolation.

**Admin Screen Modifications**

The admin screens (Task 8) should be updated to respect workspace boundaries, ensuring that administrators can only manage users and data within their assigned workspaces while maintaining the existing role-based access controls.

This enhanced multi-tenant architecture will provide robust workspace management capabilities while maintaining the security and isolation principles already established in your project. The migration strategy ensures minimal disruption to your existing functionality while enabling future scalability and enhanced tenant management features.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-10-05T16:25:46.088Z*
