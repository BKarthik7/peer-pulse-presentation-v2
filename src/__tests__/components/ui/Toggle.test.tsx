import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toggle } from '../../../components/ui/toggle';

describe('Toggle Component', () => {
  it('renders toggle with text', () => {
    render(<Toggle>Toggle me</Toggle>);
    expect(screen.getByText('Toggle me')).toBeInTheDocument();
  });

  it('handles pressed state changes', () => {
    const handlePressedChange = jest.fn();
    render(<Toggle onPressedChange={handlePressedChange}>Toggle</Toggle>);
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);
    expect(handlePressedChange).toHaveBeenCalled();
  });

  it('applies disabled state', () => {
    render(<Toggle disabled>Disabled</Toggle>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies pressed state', () => {
    render(<Toggle pressed>Pressed</Toggle>);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('data-state', 'on');
  });
}); 