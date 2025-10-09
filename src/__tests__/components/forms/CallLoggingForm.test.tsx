/**
 * Call Logging Form Tests
 * Tests for the enhanced call logging form functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedCallLoggingForm from '@/components/calls/EnhancedCallLoggingForm';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Mock the hooks
jest.mock('@/hooks/useAuth');
jest.mock('@/contexts/WorkspaceContext');

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.Mock;
const mockUseWorkspace = useWorkspace as jest.Mock;

describe('EnhancedCallLoggingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      isLoaded: true,
      isSignedIn: true
    });

    mockUseWorkspace.mockReturnValue({
      currentWorkspace: { id: 'workspace-123', name: 'Test Workspace' },
      isLoading: false
    });

    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  it('renders without crashing', () => {
    render(<EnhancedCallLoggingForm />);
    
    expect(screen.getByText(/enhanced call logging/i)).toBeInTheDocument();
  });

  it('displays all required form fields', () => {
    render(<EnhancedCallLoggingForm />);
    
    // Check for key form fields that actually exist
    expect(screen.getByLabelText(/prospect name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prospect email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prospect phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/call type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/call duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lead source/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/source of set appointment/i)).toBeInTheDocument();
  });

  it('renders submit and cancel buttons', () => {
    render(<EnhancedCallLoggingForm />);
    
    expect(screen.getByRole('button', { name: /log enhanced call/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('allows form field input', () => {
    render(<EnhancedCallLoggingForm />);
    
    const prospectNameInput = screen.getByLabelText(/prospect name/i);
    fireEvent.change(prospectNameInput, {
      target: { value: 'John Doe' }
    });
    
    expect(prospectNameInput).toHaveValue('John Doe');
  });

  it('handles lead source selection', () => {
    render(<EnhancedCallLoggingForm />);
    
    const leadSourceSelect = screen.getByLabelText(/lead source/i);
    fireEvent.change(leadSourceSelect, {
      target: { value: 'organic' }
    });
    
    expect(leadSourceSelect).toHaveValue('organic');
  });

  it('handles source of appointment selection', () => {
    render(<EnhancedCallLoggingForm />);
    
    const sourceSelect = screen.getByLabelText(/source of set appointment/i);
    fireEvent.change(sourceSelect, {
      target: { value: 'email' }
    });
    
    expect(sourceSelect).toHaveValue('email');
  });

  it('handles missing workspace gracefully', () => {
    mockUseWorkspace.mockReturnValue({
      currentWorkspace: null,
      isLoading: false
    });

    render(<EnhancedCallLoggingForm />);
    
    // Should still render the form
    expect(screen.getByText(/enhanced call logging/i)).toBeInTheDocument();
  });

  it('handles unauthenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false
    });

    render(<EnhancedCallLoggingForm />);
    
    // Should show loading or redirect (depending on implementation)
    // The component should handle this gracefully
    expect(screen.getByText(/enhanced call logging/i)).toBeInTheDocument();
  });

  it('displays form sections correctly', () => {
    render(<EnhancedCallLoggingForm />);
    
    // Check for section headers
    expect(screen.getByText(/call information/i)).toBeInTheDocument();
    expect(screen.getByText(/call details & outcomes/i)).toBeInTheDocument();
    expect(screen.getByText(/team information/i)).toBeInTheDocument();
    expect(screen.getByText(/additional information/i)).toBeInTheDocument();
  });

  it('has proper form accessibility', () => {
    render(<EnhancedCallLoggingForm />);
    
    // Check for proper form structure
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('aria-label', 'Enhanced Call Logging Form');
    
    // Check for proper heading structure
    const mainHeading = screen.getByRole('banner');
    expect(mainHeading).toBeInTheDocument();
  });
});