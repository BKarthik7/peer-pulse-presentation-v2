import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';

describe('Avatar Component', () => {
  it('renders avatar with fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>TS</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('TS')).toBeInTheDocument();
  });

  it('renders avatar with image and fallback', () => {
    render(
      <Avatar>
        <AvatarImage src="test.jpg" alt="Test" />
        <AvatarFallback>TS</AvatarFallback>
      </Avatar>
    );
    // In test environment, the image fails to load and fallback is shown
    expect(screen.getByText('TS')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarFallback>TS</AvatarFallback>
      </Avatar>
    );
    const avatar = screen.getByText('TS').closest('[class*="relative"]');
    expect(avatar).toHaveClass('custom-avatar');
  });
}); 