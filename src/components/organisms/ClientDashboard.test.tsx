import { render, screen } from '@testing-library/react';
import ClientDashboard from './ClientDashboard';

describe('ClientDashboard', () => {
  const mockJobs = [
    { _id: '1', title: 'Cyber Project', status: 'ACTIVE' },
    { _id: '2', title: 'Retro Web', status: 'COMPLETED' },
  ];

  it('renders the dashboard title', () => {
    render(<ClientDashboard jobs={[]} />);
    expect(screen.getByText(/Your projects/i)).toBeInTheDocument();
  });

  it('renders a list of jobs', () => {
    render(<ClientDashboard jobs={mockJobs as any} />);
    expect(screen.getByText(/Cyber Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Retro Web/i)).toBeInTheDocument();
  });

  it('shows a message when no jobs are present', () => {
    render(<ClientDashboard jobs={[]} />);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });
});
