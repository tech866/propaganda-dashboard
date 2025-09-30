import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-medium',
      'transition-all',
      'duration-200'
    );
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-primary/10', 'text-primary', 'border-primary/20');

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary/10', 'text-secondary-foreground', 'border-secondary/20');

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive/10', 'text-destructive', 'border-destructive/20');

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('text-foreground', 'border-border');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders with children', () => {
    render(
      <Badge>
        <span>Badge with span</span>
      </Badge>
    );
    const badge = screen.getByText('Badge with span');
    expect(badge).toBeInTheDocument();
  });

  it('handles different content types', () => {
    render(<Badge>Text Content</Badge>);
    expect(screen.getByText('Text Content')).toBeInTheDocument();

    render(<Badge>123</Badge>);
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('maintains accessibility', () => {
    render(<Badge>Accessible Badge</Badge>);
    const badge = screen.getByText('Accessible Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe('SPAN');
  });

  it('renders with icons or other elements', () => {
    render(
      <Badge>
        <span>🔔</span>
        <span>Notification</span>
      </Badge>
    );
    
    expect(screen.getByText('🔔')).toBeInTheDocument();
    expect(screen.getByText('Notification')).toBeInTheDocument();
  });
});
