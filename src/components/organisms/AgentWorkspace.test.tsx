import { render, screen } from '@testing-library/react';
import AgentWorkspace from './AgentWorkspace';

describe('AgentWorkspace', () => {
  const mockJobs = [
    { _id: '1', title: 'New Brief', status: 'PENDING' },
    { _id: '2', title: 'Active Op', status: 'ACTIVE' },
  ];

  it('renders the workspace title', () => {
    render(<AgentWorkspace jobs={[]} />);
    expect(screen.getByText(/AGENCY WORKSTATION/i)).toBeInTheDocument();
  });

  it('renders pending and active jobs', () => {
    render(<AgentWorkspace jobs={mockJobs as any} />);
    expect(screen.getByText(/New Brief/i)).toBeInTheDocument();
    const activeOps = screen.getAllByText(/Active Op/i);
    expect(activeOps.length).toBeGreaterThan(0);
  });
});
