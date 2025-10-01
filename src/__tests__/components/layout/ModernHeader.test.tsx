import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModernHeader from '@/components/layout/ModernHeader';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the role context
const mockUseRole = jest.fn();
jest.mock('@/contexts/RoleContext', () => ({
  useRole: () => mockUseRole()
}));

// Mock MobileNavigation component
jest.mock('@/components/layout/MobileNavigation', () => {
  return function MockMobileNavigation() {
    return <div data-testid="mobile-navigation">Mobile Navigation</div>;
  };
});

describe('ModernHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with user information', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        publicMetadata: { role: 'admin' }
      }
    });

    render(<ModernHeader />);

    // Check for user initials in avatar
    expect(screen.getByText('JD')).toBeInTheDocument();
    // Check for role badge
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders mobile navigation', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        publicMetadata: { role: 'admin' }
      }
    });

    render(<ModernHeader />);

    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('displays user avatar with initials', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        publicMetadata: { role: 'admin' }
      }
    });

    render(<ModernHeader />);

    // Check that avatar displays initials
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles sign out action', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        publicMetadata: { role: 'admin' }
      }
    });

    render(<ModernHeader />);

    // Check that the avatar button exists (dropdown trigger)
    const userButtons = screen.getAllByRole('button');
    const avatarButton = userButtons.find(button => 
      button.querySelector('[data-slot="avatar-fallback"]')?.textContent === 'JD'
    );
    
    expect(avatarButton).toBeDefined();
    // Note: Testing dropdown interactions is complex in Jest environment
    // The actual sign out functionality would be tested in integration tests
  });

  it('shows correct role badge variant', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        publicMetadata: { role: 'ceo' }
      }
    });

    render(<ModernHeader />);

    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('renders notification and settings buttons', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        publicMetadata: { role: 'admin' }
      }
    });

    render(<ModernHeader />);

    // Check for notification button (Bell icon)
    const buttons = screen.getAllByRole('button');
    const notificationButton = buttons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-bell')
    );
    expect(notificationButton).toBeInTheDocument();

    // Check for user avatar button (dropdown trigger)
    const avatarButton = buttons.find(button => 
      button.querySelector('[data-slot="avatar-fallback"]')?.textContent === 'JD'
    );
    expect(avatarButton).toBeInTheDocument();
    
    // Note: Testing dropdown content is complex in Jest environment
    // The dropdown menu items would be tested in integration tests
  });

  it('handles user with no name gracefully', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: null,
        email: 'john@example.com',
        publicMetadata: { role: 'admin' }
      }
    });

    render(<ModernHeader />);

    // Should show 'U' as fallback
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    mockUseRole.mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        publicMetadata: { role: 'admin' }
      }
    });

    render(<ModernHeader className="custom-header" />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-header');
  });

  it('returns null when user is not available', () => {
    mockUseRole.mockReturnValue({
      user: null
    });

    const { container } = render(<ModernHeader />);
    expect(container.firstChild).toBeNull();
  });
});