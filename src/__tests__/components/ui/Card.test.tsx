import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      render(<Card>Card content</Card>);
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl', 'border', 'bg-card', 'text-card-foreground', 'shadow-modern');
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Card content</Card>);
      const card = screen.getByText('Card content');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CardHeader', () => {
    it('renders with default props', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header content</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header content');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('renders with default props', () => {
      render(
        <Card>
          <CardTitle>Card Title</CardTitle>
        </Card>
      );
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('font-semibold', 'leading-none', 'tracking-tight');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardTitle className="custom-title">Card Title</CardTitle>
        </Card>
      );
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('renders with default props', () => {
      render(
        <Card>
          <CardDescription>Card description</CardDescription>
        </Card>
      );
      const description = screen.getByText('Card description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardDescription className="custom-description">Card description</CardDescription>
        </Card>
      );
      const description = screen.getByText('Card description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('CardContent', () => {
    it('renders with default props', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>
      );
      const content = screen.getByText('Card content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardContent className="custom-content">Card content</CardContent>
        </Card>
      );
      const content = screen.getByText('Card content');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('renders with default props', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('applies custom className', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer content</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer content');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the card content</p>
          </CardContent>
          <CardFooter>
            <p>This is the footer</p>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('This is a test card')).toBeInTheDocument();
      expect(screen.getByText('This is the card content')).toBeInTheDocument();
      expect(screen.getByText('This is the footer')).toBeInTheDocument();
    });
  });
});
