import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByText('Propaganda Dashboard')).toBeInTheDocument();
  });

  it('renders the hero section', () => {
    render(<Home />);
    expect(screen.getByText('Agency Client Tracking')).toBeInTheDocument();
    expect(screen.getByText('Made Simple')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Home />);
    expect(screen.getByText(/Track call performance, analyze metrics, and manage your sales team/)).toBeInTheDocument();
  });

  it('renders sign in and get started buttons', () => {
    render(<Home />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<Home />);
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Multi-Tenant')).toBeInTheDocument();
    expect(screen.getByText('Role-Based Access')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Home />);
    expect(screen.getByText(/Track Show Rate and Close Rate with real-time calculations/)).toBeInTheDocument();
    expect(screen.getByText(/Manage multiple clients with complete data isolation/)).toBeInTheDocument();
    expect(screen.getByText(/Secure access control for Sales, Admin, and CEO roles/)).toBeInTheDocument();
  });

  it('renders demo section', () => {
    render(<Home />);
    expect(screen.getByText('Try the Demo')).toBeInTheDocument();
    expect(screen.getByText('Demo Sign In')).toBeInTheDocument();
    expect(screen.getByText('Use: test@example.com / password123')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Home />);
    expect(screen.getByText(/© 2024 Propaganda Dashboard/)).toBeInTheDocument();
    expect(screen.getByText(/Built with Next.js and Tailwind CSS/)).toBeInTheDocument();
  });

  it('has proper navigation links', () => {
    render(<Home />);
    
    const signInLink = screen.getByText('Sign In').closest('a');
    const getStartedLink = screen.getByText('Get Started').closest('a');
    const demoSignInLink = screen.getByText('Demo Sign In').closest('a');
    
    expect(signInLink).toHaveAttribute('href', '/auth/signin');
    expect(getStartedLink).toHaveAttribute('href', '/auth/register');
    expect(demoSignInLink).toHaveAttribute('href', '/auth/signin');
  });

  it('renders with proper styling classes', () => {
    render(<Home />);
    
    const header = screen.getByText('Propaganda Dashboard').closest('header');
    const main = screen.getByText('Agency Client Tracking').closest('main');
    const footer = screen.getByText(/© 2024 Propaganda Dashboard/).closest('footer');
    
    expect(header).toHaveClass('border-b', 'border-border/50', 'bg-background/80', 'backdrop-blur-sm');
    expect(main).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-20');
    expect(footer).toHaveClass('border-t', 'border-border/50', 'bg-background/80', 'backdrop-blur-sm');
  });

  it('renders all interactive elements', () => {
    render(<Home />);
    
    const links = screen.getAllByRole('link');
    
    // Should have multiple links (buttons are rendered as links in this case)
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders with proper accessibility', () => {
    render(<Home />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4); // Multiple h3 elements
  });
});
