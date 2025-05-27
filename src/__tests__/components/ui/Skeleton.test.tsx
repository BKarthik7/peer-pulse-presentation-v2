import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton } from '../../../components/ui/skeleton';

describe('Skeleton Component', () => {
  it('renders skeleton element', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('applies custom dimensions', () => {
    render(<Skeleton className="w-10 h-10" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('w-10 h-10');
  });

  it('renders with default animation', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
  });
}); 