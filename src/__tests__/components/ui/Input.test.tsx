import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '../../../components/ui/input';

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies type attribute', () => {
    render(<Input type="password" defaultValue="test" />);
    const input = screen.getByDisplayValue('test');
    expect(input).toHaveAttribute('type', 'password');
  });
}); 