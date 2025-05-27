import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '../../../components/ui/badge';

describe('Badge Component', () => {
  it('renders badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-secondary');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary');
  });
}); 