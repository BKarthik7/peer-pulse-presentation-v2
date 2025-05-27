import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';

describe('Card Component', () => {
  it('renders card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-card">Test</Card>);
    const card = screen.getByText('Test').closest('div');
    expect(card).toHaveClass('custom-card');
  });

  it('renders card with just content', () => {
    render(
      <Card>
        <CardContent>Simple Card</CardContent>
      </Card>
    );
    expect(screen.getByText('Simple Card')).toBeInTheDocument();
  });
}); 