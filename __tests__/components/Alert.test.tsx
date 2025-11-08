import { render, screen } from '@testing-library/react';
import Alert from '@/components/Alert';

describe('Alert Component', () => {
  it('renders alert with message', () => {
    render(<Alert message="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success variant', () => {
    const { container } = render(<Alert message="Success" variant="success" />);
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
  });

  it('renders error variant', () => {
    const { container } = render(<Alert message="Error" variant="error" />);
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
  });
});
