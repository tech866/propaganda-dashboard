// =====================================================
// Workspace Management TypeScript Interfaces
// Task 20.1: Multi-Tenant Data Isolation Types
// =====================================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  permissions: Record<string, any>;
  status: MembershipStatus;
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  invited_by: string;
  accepted_by?: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceAnalytics {
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  total_members: number;
  admin_count: number;
  manager_count: number;
  sales_rep_count: number;
  client_count: number;
  total_clients: number;
  total_calls: number;
  completed_calls: number;
  closed_calls: number;
  total_cash_collected: number;
  total_revenue: number;
  workspace_created_at: string;
}

export interface UserWorkspace {
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  user_role: WorkspaceRole;
  membership_status: MembershipStatus;
  joined_at: string;
}

// =====================================================
// Enums and Constants
// =====================================================

export type WorkspaceRole = 'admin' | 'manager' | 'sales_rep' | 'client' | 'viewer';

export type MembershipStatus = 'active' | 'pending' | 'suspended' | 'removed';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export const WORKSPACE_ROLES = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  SALES_REP: 'sales_rep' as const,
  CLIENT: 'client' as const,
  VIEWER: 'viewer' as const,
} as const;

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active' as const,
  PENDING: 'pending' as const,
  SUSPENDED: 'suspended' as const,
  REMOVED: 'removed' as const,
} as const;

export const INVITATION_STATUS = {
  PENDING: 'pending' as const,
  ACCEPTED: 'accepted' as const,
  EXPIRED: 'expired' as const,
  CANCELLED: 'cancelled' as const,
} as const;

// =====================================================
// Role Permissions
// =====================================================

export const ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  admin: [
    'workspace:manage',
    'members:invite',
    'members:remove',
    'members:manage_roles',
    'clients:create',
    'clients:read',
    'clients:update',
    'clients:delete',
    'calls:create',
    'calls:read',
    'calls:update',
    'calls:delete',
    'analytics:view',
    'settings:manage',
  ],
  manager: [
    'members:invite',
    'clients:create',
    'clients:read',
    'clients:update',
    'calls:create',
    'calls:read',
    'calls:update',
    'calls:delete',
    'analytics:view',
  ],
  sales_rep: [
    'clients:read',
    'calls:create',
    'calls:read',
    'calls:update',
    'analytics:view_own',
  ],
  client: [
    'calls:read_own',
    'analytics:view_own',
  ],
  viewer: [
    'calls:read',
    'analytics:view',
  ],
};

// =====================================================
// API Request/Response Types
// =====================================================

export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  slug?: string;
  description?: string;
  settings?: Record<string, any>;
  is_active?: boolean;
}

export interface InviteUserRequest {
  email: string;
  role: WorkspaceRole;
  expires_in_hours?: number;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface UpdateMembershipRequest {
  role?: WorkspaceRole;
  status?: MembershipStatus;
  permissions?: Record<string, any>;
}

// =====================================================
// Workspace Context Types
// =====================================================

export interface WorkspaceContext {
  currentWorkspace: Workspace | null;
  userRole: WorkspaceRole | null;
  userPermissions: string[];
  availableWorkspaces: UserWorkspace[];
  isLoading: boolean;
  error: string | null;
}

export interface WorkspaceProviderProps {
  children: React.ReactNode;
  workspaceId?: string;
}

// =====================================================
// Utility Types
// =====================================================

export interface WorkspaceScopedEntity {
  workspace_id: string;
}

export interface WorkspaceScopedCall extends WorkspaceScopedEntity {
  id: string;
  client_id: string;
  user_id: string;
  // ... other call fields
}

export interface WorkspaceScopedClient extends WorkspaceScopedEntity {
  id: string;
  name: string;
  email?: string;
  // ... other client fields
}

// =====================================================
// Validation Schemas (for use with Yup)
// =====================================================

export const WORKSPACE_SLUG_REGEX = /^[a-z0-9-]+$/;

export const WORKSPACE_NAME_MIN_LENGTH = 2;
export const WORKSPACE_NAME_MAX_LENGTH = 255;
export const WORKSPACE_SLUG_MIN_LENGTH = 2;
export const WORKSPACE_SLUG_MAX_LENGTH = 255;
export const WORKSPACE_DESCRIPTION_MAX_LENGTH = 1000;

// =====================================================
// Error Types
// =====================================================

export interface WorkspaceError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export const WORKSPACE_ERROR_CODES = {
  WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
  WORKSPACE_ACCESS_DENIED: 'WORKSPACE_ACCESS_DENIED',
  INVALID_WORKSPACE_SLUG: 'INVALID_WORKSPACE_SLUG',
  WORKSPACE_SLUG_TAKEN: 'WORKSPACE_SLUG_TAKEN',
  INVITATION_NOT_FOUND: 'INVITATION_NOT_FOUND',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVITATION_ALREADY_ACCEPTED: 'INVITATION_ALREADY_ACCEPTED',
  USER_ALREADY_MEMBER: 'USER_ALREADY_MEMBER',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_ROLE: 'INVALID_ROLE',
} as const;
