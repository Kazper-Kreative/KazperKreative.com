import { render, screen, fireEvent } from '@testing-library/react';
import AgentWorkspace from './AgentWorkspace';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/hooks/useUISound', () => ({
  useUISound: () => ({ playSound: jest.fn() }),
}));

jest.mock('@/components/atoms/ClientSafeIcon', () => {
  return function MockIcon({ name }: { name: string }) {
    return <span data-testid={`icon-${name}`}>{name}</span>;
  };
});

const mockJobs = [
  { _id: 'job-1', title: 'Build MVP', status: 'PENDING' as const, description: 'Create an MVP', client: { name: 'Acme Corp' } },
  { _id: 'job-2', title: 'QA Sprint', status: 'ACTIVE' as const, description: 'Run QA cycle' },
  { _id: 'job-3', title: 'Ship v1', status: 'COMPLETED' as const },
];

describe('AgentWorkspace', () => {
  it('renders the workspace title', () => {
    render(<AgentWorkspace jobs={[]} />);
    expect(screen.getByText(/Workstation/i)).toBeInTheDocument();
  });

  it('renders three columns', () => {
    render(<AgentWorkspace jobs={mockJobs} />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('displays jobs in correct columns', () => {
    render(<AgentWorkspace jobs={mockJobs} />);
    expect(screen.getByText('Build MVP')).toBeInTheDocument();
    expect(screen.getByText('QA Sprint')).toBeInTheDocument();
    expect(screen.getByText('Ship v1')).toBeInTheDocument();
  });

  it('shows client name when available', () => {
    render(<AgentWorkspace jobs={mockJobs} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows empty-state message for empty columns', () => {
    render(<AgentWorkspace jobs={[]} />);
    const emptyLabels = screen.getAllByText('Nothing here yet');
    expect(emptyLabels.length).toBe(3);
  });

  it('moves job from PENDING to ACTIVE on accept', () => {
    render(<AgentWorkspace jobs={[mockJobs[0]]} />);
    fireEvent.click(screen.getByTestId('icon-Check'));
    expect(screen.queryByTestId('icon-Check')).not.toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('moves job from PENDING to DECLINED on decline', () => {
    render(<AgentWorkspace jobs={[mockJobs[0]]} />);
    fireEvent.click(screen.getByTestId('icon-X'));
    expect(screen.queryByText('Build MVP')).not.toBeInTheDocument();
  });

  it('moves job from ACTIVE to COMPLETED on complete', () => {
    render(<AgentWorkspace jobs={[mockJobs[1]]} />);
    fireEvent.click(screen.getByText('Complete'));
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
  });
});
