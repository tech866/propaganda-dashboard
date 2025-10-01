import React from 'react';
import { render, screen } from '@testing-library/react';
import { TailusProvider } from '@/components/providers/TailusProvider';

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

  it('applies Tailus-specific CSS variables to document root', () => {
    render(
      <TailusProvider>
        <div>Test Content</div>
      </TailusProvider>
    );

    // Check that Tailus-specific CSS custom properties are applied
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--tailus-radius')).toBe('0.75rem');
    expect(root.style.getPropertyValue('--tailus-shadow')).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.1)');
    
    // Check that tailus-theme class is added
    expect(root.classList.contains('tailus-theme')).toBe(true);
  });

  it('applies theming on mount', () => {
    const { unmount } = render(
      <TailusProvider>
        <div>Test Content</div>
      </TailusProvider>
    );

    // Check that Tailus theming is applied
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--tailus-radius')).toBe('0.75rem');
    expect(root.style.getPropertyValue('--tailus-shadow')).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.1)');
    expect(root.classList.contains('tailus-theme')).toBe(true);

    // Unmount component
    unmount();

    // Theming should still be applied (no cleanup in current implementation)
    expect(root.style.getPropertyValue('--tailus-radius')).toBe('0.75rem');
    expect(root.style.getPropertyValue('--tailus-shadow')).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.1)');
    expect(root.classList.contains('tailus-theme')).toBe(true);
  });
});
