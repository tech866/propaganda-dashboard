import React from 'react';
import { render, screen } from '@testing-library/react';
import { TailusProvider } from '@/components/providers/TailusProvider';

// Mock Tailus themer
jest.mock('@tailus/themer', () => ({
  palette: jest.fn(() => ({
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#0f172a',
    foreground: '#f8fafc'
  }))
}));

describe('TailusProvider', () => {
  beforeEach(() => {
    // Clear any existing CSS custom properties
    document.documentElement.style.cssText = '';
  });

  it('renders children', () => {
    render(
      <TailusProvider>
        <div data-testid="test-content">Test Content</div>
      </TailusProvider>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies Tailus theming to document root', () => {
    const { palette } = require('@tailus/themer');
    const mockPalette = {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#0f172a',
      foreground: '#f8fafc'
    };
    palette.mockReturnValue(mockPalette);

    render(
      <TailusProvider>
        <div>Test Content</div>
      </TailusProvider>
    );

    // Check that CSS custom properties are applied
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#3b82f6');
    expect(root.style.getPropertyValue('--secondary')).toBe('#64748b');
    expect(root.style.getPropertyValue('--background')).toBe('#0f172a');
    expect(root.style.getPropertyValue('--foreground')).toBe('#f8fafc');
  });

  it('calls palette with dark theme', () => {
    const { palette } = require('@tailus/themer');
    
    render(
      <TailusProvider>
        <div>Test Content</div>
      </TailusProvider>
    );

    expect(palette).toHaveBeenCalledWith('dark');
  });

  it('handles palette with non-string values gracefully', () => {
    const { palette } = require('@tailus/themer');
    const mockPalette = {
      primary: '#3b82f6',
      secondary: { light: '#64748b', dark: '#475569' }, // Non-string value
      background: '#0f172a',
      foreground: '#f8fafc'
    };
    palette.mockReturnValue(mockPalette);

    render(
      <TailusProvider>
        <div>Test Content</div>
      </TailusProvider>
    );

    // Should only apply string values
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#3b82f6');
    expect(root.style.getPropertyValue('--secondary')).toBe(''); // Non-string value should not be applied
    expect(root.style.getPropertyValue('--background')).toBe('#0f172a');
    expect(root.style.getPropertyValue('--foreground')).toBe('#f8fafc');
  });

  it('applies theming on mount and cleanup on unmount', () => {
    const { palette } = require('@tailus/themer');
    const mockPalette = {
      primary: '#3b82f6',
      secondary: '#64748b'
    };
    palette.mockReturnValue(mockPalette);

    const { unmount } = render(
      <TailusProvider>
        <div>Test Content</div>
      </TailusProvider>
    );

    // Check that theming is applied
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#3b82f6');

    // Unmount component
    unmount();

    // Theming should still be applied (no cleanup in current implementation)
    expect(root.style.getPropertyValue('--primary')).toBe('#3b82f6');
  });
});
