---
title: Research Session
query: "How to implement multi-tenant workspace management with client onboarding, team member invitations, role-based access control, and email invitations using Resend API in Next.js applications"
date: 10/5/2025
time: 11:42:07 PM
timestamp: 2025-10-06T03:42:07.139Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** How to implement multi-tenant workspace management with client onboarding, team member invitations, role-based access control, and email invitations using Resend API in Next.js applications

**Response:**

## Multi-Tenant Workspace Management in Next.js: Architecture, Implementation, and Integration

Implementing multi-tenant workspace management in a Next.js application—with features like client onboarding, team member invitations, role-based access control (RBAC), and email invitations—requires careful architectural planning, robust backend services, and seamless frontend integration. This research provides a comprehensive, actionable guide tailored to your project’s context, leveraging your existing authentication (Clerk), database (Supabase), and UI (Tailwind CSS) stack.

---

## Multi-Tenancy Fundamentals

**Multi-tenancy** means serving multiple isolated groups (tenants) from a single application instance, each with their own data, users, and permissions. In SaaS, this often manifests as workspaces, organizations, or teams. There are two primary approaches:

- **Path-based tenancy**: `/workspace/{workspaceSlug}` routes, where the workspace is part of the URL[1].
- **Subdomain-based tenancy**: `{workspace}.app.example.com`, where each tenant gets a unique subdomain[2].

Your project already uses path-based routing (e.g., `/workspace/[workspaceId]`), which is well-supported by Next.js dynamic routes and is easier to manage with Clerk’s session context[1]. Subdomains are possible with middleware but add complexity for little gain in your B2B context[2].

---

## Data Isolation and Workspace Context

**Data isolation** is critical: users in one workspace must not access another’s data. This is enforced at both the database and application layers.

### Database Layer

- **Schema design**: Each table (e.g., `calls`, `clients`) includes a `workspace_id` column. All queries filter by `workspace_id`.
- **Row-Level Security (RLS)**: Supabase RLS policies ensure users can only access rows where `workspace_id` matches their membership.
- **Foreign keys**: Ensure all related records (e.g., `calls` → `clients`) are scoped to the same workspace.

### Application Layer

- **Workspace context**: Your `WorkspaceContext` React context tracks the current workspace, user role, and permissions[src/contexts/WorkspaceContext.tsx]. This context is initialized on route load and updated when switching workspaces.
- **Route protection**: Middleware or page-level checks verify the user has access to the requested workspace before rendering.

```tsx
// Example: Workspace context provider
export function WorkspaceProvider({ children, workspaceId }: WorkspaceProviderProps) {
  const { user } = useUser();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [userRole, setUserRole] = useState<WorkspaceRole | null>(null);
  // ...load workspace and membership
}
```
[src/contexts/WorkspaceContext.tsx]

---

## Client Onboarding

**Client onboarding** is the process of creating a new workspace (tenant) and associating the initial user (admin) with it.

### Steps

1. **User signs up** via Clerk (already implemented).
2. **Create workspace**: The user submits a form (e.g., workspace name, slug). Your `WorkspaceService.createWorkspace` handles this, creating the workspace and adding the user as an admin[src/lib/services/workspaceService.ts].
3. **Initial setup**: Optionally, guide the user through adding clients, team members, or configuring settings.

```ts
// Example: Create a new workspace
static async createWorkspace(workspaceData: CreateWorkspaceRequest, adminUserId: string): Promise<Workspace> {
  const result = await query(`
    SELECT create_workspace($1, $2, $3, $4) as workspace_id
  `, [workspaceData.name, workspaceData.slug, workspaceData.description, adminUserId]);
  return this.getWorkspaceById(result.rows[0].workspace_id);
}
```
[src/lib/services/workspaceService.ts]

---

## Team Member Invitations

**Inviting team members** allows workspace admins to add users by email, assigning roles (admin, manager, sales_rep, etc.).

### Flow

1. **Admin submits invite**: Enters email and role, submits to `WorkspaceService.inviteUser`.
2. **Generate token**: A unique, expiring token is stored in the `invitations` table.
3. **Send email**: An invitation email is sent with a link to `/invitations/accept?token={token}`.
4. **Accept invitation**: The user clicks the link, signs up (if new), and is added to the workspace with the assigned role.

```ts
// Example: Invite a user
static async inviteUser(workspaceId: string, inviteData: InviteUserRequest, invitedBy: string): Promise<string> {
  const result = await query(`
    SELECT invite_user_to_workspace($1, $2, $3, $4, $5) as token
  `, [workspaceId, inviteData.email, inviteData.role, invitedBy, inviteData.expires_in_hours]);
  const token = result.rows[0].token;
  // ...send email with invitationLink
}
```
[src/lib/services/workspaceService.ts]

---

## Email Invitations with Resend API

Your current `EmailService` uses `nodemailer`, but **Resend API** is a modern, transactional email service ideal for SaaS. To integrate:

1. **Replace `nodemailer` with Resend**: Install `@resend/resend` and update `EmailService`.
2. **Send invitation emails**: Use Resend’s JS client to send templated emails.
3. **Track delivery**: Resend provides webhooks for delivery status.

```ts
import { Resend } from '@resend/resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      await resend.emails.send({
        from: 'onboarding@propaganda-dashboard.com',
        to: data.recipientEmail,
        subject: `Invitation to join ${data.workspaceName}`,
        html: this.generateInvitationEmailHTML(data),
      });
      return true;
    } catch (error) {
      console.error('Resend error:', error);
      return false;
    }
  }
}
```
[src/lib/services/emailService.ts]

**Benefits**: Better deliverability, analytics, and scalability. **Migration**: Keep your existing templates and swap the transport layer.

---

## Role-Based Access Control (RBAC)

**RBAC** ensures users only see and do what their role permits. Your project already defines roles (`admin`, `manager`, `sales_rep`, `client`, `viewer`) and permissions (e.g., `members:invite`, `calls:create`)[src/contexts/WorkspaceContext.tsx].

### Implementation

- **Database**: The `workspace_memberships` table stores `user_id`, `workspace_id`, `role`, and optional custom permissions.
- **Context**: The `WorkspaceContext` provides `hasPermission` and `hasRole` helpers for UI checks.
- **API**: All backend routes check the user’s role/permissions before proceeding.

```tsx
// Example: RBAC hook
export function useRBAC(options: UseRBACOptions): UseRBACReturn {
  // ...fetch user's role and permissions for the workspace
  const checkPermission = (permission: string): boolean => {
    return state.permissions.includes(permission);
  };
  // ...use in components
}
```
[src/hooks/useRBAC.ts]

### Edge Cases

- **Cross-workspace access**: Ensure middleware and RLS prevent users from accessing other workspaces by ID manipulation.
- **Role escalation**: Validate role changes are only performed by admins.
- **Custom permissions**: Support extending beyond predefined roles via the `permissions` JSON column.

---

## Workspace Switching

Users in multiple workspaces need a **workspace switcher**—a dropdown that changes the active workspace and updates the URL.

```tsx
export function WorkspaceSwitcher() {
  const { availableWorkspaces, currentWorkspace, switchWorkspace } = useWorkspace();
  return (
    <select value={currentWorkspace?.id} onChange={(e) => switchWorkspace(e.target.value)}>
      {availableWorkspaces.map((ws) => (
        <option key={ws.workspace_id} value={ws.workspace_id}>{ws.workspace_name}</option>
      ))}
    </select>
  );
}
```
[src/contexts/WorkspaceContext.tsx]

**UX**: Update the URL to reflect the new workspace (e.g., `/workspace/{newSlug}`) without full page reloads for a SPA feel.

---

## Audit Logging

**Audit logs** track who did what and when. Your project already implements this via triggers or application logging[Task 9]. Extend this to workspace-scoped actions (e.g., “User X invited Y to workspace Z”).

**Schema**: Add `workspace_id` to audit logs. **Query**: Always filter logs by `workspace_id` for tenant isolation.

---

## Testing and Quality Assurance

**Test coverage** should include:

- **Workspace creation**: Verify admins can create workspaces and are automatically added.
- **Invitations**: Test email delivery, token expiry, and role assignment.
- **RBAC**: Verify each role has correct access; attempt privilege escalation.
- **Data isolation**: Attempt to access another workspace’s data via API or UI.
- **Edge cases**: Invite existing users, resend/cancel invitations, handle expired tokens.

**Automation**: Use Playwright for E2E flows, Jest for unit/integration tests.

---

## Integration with Existing Tasks

- **Task 2 (Authentication)**: Clerk provides the user identity; map Clerk `user.id` to your `users` table.
- **Task 4 (RBAC)**: Extend to workspace-scoped roles using `WorkspaceContext` and `useRBAC`.
- **Task 6 (Calls CRUD)**: Ensure all calls are scoped to `workspace_id`.
- **Task 8 (Admin Screens)**: Add workspace management UI (members, invitations, settings).
- **Task 10 (Client Switcher)**: Implement the workspace switcher component.
- **Task 11 (Filtering)**: Ensure filters respect workspace boundaries.

---

## Potential Pitfalls and Mitigations

- **Email deliverability**: Use Resend or similar service; monitor bounce/spam rates.
- **Token security**: Use short-lived, single-use tokens for invitations.
- **Performance**: Index `workspace_id` on all tenant tables; consider read replicas for scaling.
- **Complexity**: Keep the workspace context simple; avoid over-engineering permission checks.
- **Migration**: Plan carefully if migrating existing data to a multi-tenant schema.

---

## Summary Table: Key Components

| Component               | Implementation Example                          | Location/File                          |
|-------------------------|------------------------------------------------|----------------------------------------|
| Workspace Context       | React context for current workspace/role       | src/contexts/WorkspaceContext.tsx      |
| Workspace Service       | CRUD, memberships, invitations                 | src/lib/services/workspaceService.ts   |
| Email Service           | Send invitations (nodemailer → Resend)         | src/lib/services/emailService.ts       |
| RBAC                    | Role/permission checks in context/hook         | src/hooks/useRBAC.ts                   |
| Workspace Switcher      | Dropdown to change active workspace            | src/contexts/WorkspaceContext.tsx      |
| Audit Logging           | Database triggers/app logging                  | (Task 9)                               |

---

## Actionable Recommendations

1. **Adopt Resend API** for transactional emails to improve deliverability and trackability.
2. **Enhance WorkspaceContext** to handle all multi-tenant UI state and permissions.
3. **Extend RBAC** to all API routes and UI components, using the `useRBAC` hook.
4. **Implement invitation flows** with expiry and resend/cancel options.
5. **Audit all database queries** to ensure `workspace_id` filtering.
6. **Add comprehensive tests** for all multi-tenant flows.
7. **Document the multi-tenant architecture** for future maintainers.

---

## Conclusion

Building multi-tenant workspace management in Next.js with Clerk, Supabase, and Resend is a significant but manageable undertaking. By leveraging your existing authentication, extending your data model with `workspace_id`, and implementing robust invitation and RBAC flows, you can deliver a secure, scalable, and user-friendly SaaS platform. Your current architecture is well-positioned for this evolution—focus on consistent enforcement of tenant isolation, clear permission boundaries, and a seamless user experience for onboarding and team collaboration.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-10-06T03:42:07.139Z*
