import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from '../../../components/ui/checkbox';

describe('Checkbox Component', () => {
  it('renders checkbox with label', () => {
    render(<Checkbox id="test" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles checked state changes', () => {
    const handleCheckedChange = jest.fn();
    render(<Checkbox onCheckedChange={handleCheckedChange} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalled();
  });

  it('applies disabled state', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('applies checked state', () => {
    render(<Checkbox checked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
}); 