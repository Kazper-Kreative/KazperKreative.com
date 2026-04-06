import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from './ContactForm';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
}));

jest.mock('@/components/atoms/Button', () => {
  return function MockButton({ children, ...props }: any) {
    return <button {...props}>{children}</button>;
  };
});

const mockOnClose = jest.fn();

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders the form fields', () => {
    render(<ContactForm onClose={mockOnClose} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('submits form data and shows success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Sent!' }),
    });

    render(<ContactForm onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByText(/send message/i));

    await waitFor(() => {
      expect(screen.getByText('Sent!')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
  });

  it('shows error message on failed submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to send' }),
    });

    render(<ContactForm onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByText(/send message/i));

    await waitFor(() => {
      expect(screen.getByText('Failed to send')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button clicked', () => {
    render(<ContactForm onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText(/close contact form/i));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
