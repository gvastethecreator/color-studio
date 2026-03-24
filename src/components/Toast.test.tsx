import { render, screen } from '@testing-library/react';
import Toast from '@/components/Toast';

describe('Toast', () => {
  it('renders status feedback when there is a message', () => {
    render(<Toast message="Copied!" onClose={() => {}} />);

    expect(screen.getByRole('status')).toHaveTextContent('Copied!');
  });

  it('renders nothing when message is null', () => {
    const { container } = render(<Toast message={null} onClose={() => {}} />);

    expect(container).toBeEmptyDOMElement();
  });
});
