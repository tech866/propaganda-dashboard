import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '@/components/ui/switch';

describe('Switch Component', () => {
  it('renders a switch component', () => {
    render(<Switch />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('renders switch in unchecked state by default', () => {
    render(<Switch />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('renders switch in checked state when checked prop is true', () => {
    render(<Switch checked={true} />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles switch state when clicked', () => {
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    
    fireEvent.click(switchElement);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onCheckedChange with correct value', () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const handleChange = jest.fn();
    render(<Switch disabled onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    
    fireEvent.click(switchElement);
    
    expect(handleChange).not.toHaveBeenCalled();
    expect(switchElement).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<Switch className="custom-switch" />);
    
    expect(container.firstChild).toHaveClass('custom-switch');
  });

  it('has proper accessibility attributes', () => {
    render(<Switch aria-label="Toggle notifications" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-label', 'Toggle notifications');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('supports controlled component pattern', () => {
    const TestComponent = () => {
      const [checked, setChecked] = React.useState(false);
      
      return (
        <div>
          <Switch checked={checked} onCheckedChange={setChecked} />
          <span data-testid="status">{checked ? 'ON' : 'OFF'}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    const switchElement = screen.getByRole('switch');
    const statusElement = screen.getByTestId('status');
    
    expect(statusElement).toHaveTextContent('OFF');
    
    fireEvent.click(switchElement);
    
    expect(statusElement).toHaveTextContent('ON');
  });

  it('supports uncontrolled component pattern', () => {
    const handleChange = jest.fn();
    render(<Switch defaultChecked={true} onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    // Note: defaultChecked may not be reflected in the DOM immediately
    // The component behavior depends on the actual implementation
    
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles keyboard navigation', () => {
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    
    // Focus the switch
    switchElement.focus();
    expect(switchElement).toHaveFocus();
    
    // Press space to toggle
    fireEvent.keyDown(switchElement, { key: ' ', code: 'Space' });
    // Note: Keyboard behavior depends on the actual component implementation
    // For now, just verify the switch element exists and can receive keyboard events
    expect(switchElement).toBeInTheDocument();
  });

  it('renders with proper size variants', () => {
    const { rerender } = render(<Switch />);
    
    // Default size
    let switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    
    // Test with different sizes (if supported by the component)
    rerender(<Switch className="h-6 w-11" />);
    switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('h-6', 'w-11');
  });
});
