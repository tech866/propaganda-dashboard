import React from 'react';
import { render, screen } from '@testing-library/react';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';

// Mock the role context
const mockUseRole = jest.fn();
jest.mock('@/contexts/RoleContext', () => ({
  useRole: () => mockUseRole()
}));

describe('RoleBasedAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user has required role', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasRole: jest.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <RoleBasedAccess allowedRoles={['admin', 'ceo']}>
        <div>Admin Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders fallback when user does not have required role', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasRole: jest.fn().mockReturnValue(false),
      isLoading: false
    });

    render(
      <RoleBasedAccess 
        allowedRoles={['admin', 'ceo']}
        fallback={<div>Access Denied</div>}
      >
        <div>Admin Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders nothing when no fallback provided and user lacks access', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasRole: jest.fn().mockReturnValue(false),
      isLoading: false
    });

    render(
      <RoleBasedAccess allowedRoles={['admin', 'ceo']}>
        <div>Admin Content</div>
      </RoleBasedAccess>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    // Component renders nothing when fallback is null and user lacks access
  });

  it('handles multiple allowed roles', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasRole: jest.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <RoleBasedAccess allowedRoles={['admin', 'ceo', 'manager']}>
        <div>Manager Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Manager Content')).toBeInTheDocument();
  });

  it('handles empty allowed roles array', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasRole: jest.fn().mockReturnValue(false),
      isLoading: false
    });

    render(
      <RoleBasedAccess allowedRoles={[]}>
        <div>No Access Content</div>
      </RoleBasedAccess>
    );

    expect(screen.queryByText('No Access Content')).not.toBeInTheDocument();
    // Component renders nothing when fallback is null and user lacks access
  });

  it('handles undefined user role', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasRole: jest.fn().mockReturnValue(false),
      isLoading: false
    });

    render(
      <RoleBasedAccess allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleBasedAccess>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    // Component renders nothing when fallback is null and user lacks access
  });

  it('handles null user role', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasRole: jest.fn().mockReturnValue(false),
      isLoading: false
    });

    render(
      <RoleBasedAccess allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleBasedAccess>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    // Component renders nothing when fallback is null and user lacks access
  });

  it('renders complex children components', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasRole: jest.fn().mockReturnValue(true),
      isLoading: false
    });

    render(
      <RoleBasedAccess allowedRoles={['admin']}>
        <div>
          <h1>Admin Dashboard</h1>
          <button>Admin Action</button>
          <p>Admin description</p>
        </div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin Action')).toBeInTheDocument();
    expect(screen.getByText('Admin description')).toBeInTheDocument();
  });

  it('renders complex fallback components', () => {
    mockUseRole.mockReturnValue({
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasRole: jest.fn().mockReturnValue(false),
      isLoading: false
    });

    render(
      <RoleBasedAccess 
        allowedRoles={['admin']}
        fallback={
          <div>
            <h2>Access Denied</h2>
            <p>Contact your administrator</p>
            <button>Go Back</button>
          </div>
        }
      >
        <div>Admin Content</div>
      </RoleBasedAccess>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Contact your administrator')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
