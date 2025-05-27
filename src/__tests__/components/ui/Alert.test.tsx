import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';

describe('Alert Component', () => {
  it('renders alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Alert variant="destructive">Test</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50');
    expect(alert).toHaveClass('text-destructive');
  });

  it('renders with default variant', () => {
    render(<Alert>Default Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-background');
    expect(alert).toHaveClass('text-foreground');
  });
}); 