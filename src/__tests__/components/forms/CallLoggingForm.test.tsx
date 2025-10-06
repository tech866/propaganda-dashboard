/**
 * Call Logging Form Tests
 * Tests for the enhanced call logging form functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedCallLoggingForm } from '@/components/forms/EnhancedCallLoggingForm';
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
    
    expect(screen.getByText(/log new call/i)).toBeInTheDocument();
  });

  it('displays all required form fields', () => {
    render(<EnhancedCallLoggingForm />);
    
    // Check for key form fields
    expect(screen.getByLabelText(/prospect name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/traffic source/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/source of appointment/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<EnhancedCallLoggingForm />);
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/prospect name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<EnhancedCallLoggingForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/prospect name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Acme Corp' }
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+1-555-0123' }
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@acme.com' }
    });
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/calls', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('John Doe')
      }));
    });
  });

  it('handles form submission errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<EnhancedCallLoggingForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/prospect name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Acme Corp' }
    });
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error logging call/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<EnhancedCallLoggingForm />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'invalid-email' }
    });
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    render(<EnhancedCallLoggingForm />);
    
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: 'invalid-phone' }
    });
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid phone format/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    // Mock slow response
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      }), 100))
    );

    render(<EnhancedCallLoggingForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/prospect name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Acme Corp' }
    });
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText(/logging call/i)).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    render(<EnhancedCallLoggingForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/prospect name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Acme Corp' }
    });
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Form should be reset
      expect(screen.getByLabelText(/prospect name/i)).toHaveValue('');
      expect(screen.getByLabelText(/company name/i)).toHaveValue('');
    });
  });

  it('handles traffic source selection', () => {
    render(<EnhancedCallLoggingForm />);
    
    const trafficSourceSelect = screen.getByLabelText(/traffic source/i);
    fireEvent.change(trafficSourceSelect, {
      target: { value: 'organic' }
    });
    
    expect(trafficSourceSelect).toHaveValue('organic');
  });

  it('handles source of appointment selection', () => {
    render(<EnhancedCallLoggingForm />);
    
    const sourceSelect = screen.getByLabelText(/source of appointment/i);
    fireEvent.change(sourceSelect, {
      target: { value: 'email' }
    });
    
    expect(sourceSelect).toHaveValue('email');
  });

  it('displays success message after submission', async () => {
    render(<EnhancedCallLoggingForm />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/prospect name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: 'Acme Corp' }
    });
    
    const submitButton = screen.getByRole('button', { name: /log call/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/call logged successfully/i)).toBeInTheDocument();
    });
  });

  it('handles missing workspace gracefully', () => {
    mockUseWorkspace.mockReturnValue({
      currentWorkspace: null,
      isLoading: false
    });

    render(<EnhancedCallLoggingForm />);
    
    // Should still render the form
    expect(screen.getByText(/log new call/i)).toBeInTheDocument();
  });
});
