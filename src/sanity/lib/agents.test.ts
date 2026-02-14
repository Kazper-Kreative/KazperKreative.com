import { getAgents } from './agents';
import { client } from './client';

// Mock sanity client
jest.mock('./client', () => ({
  client: {
    fetch: jest.fn(),
  },
}));

describe('agents utility', () => {
  it('fetches agents from sanity', async () => {
    const mockAgents = [
      {
        name: 'Agent Smith',
        role: 'Specialist',
        bio: 'Classified',
        image: { asset: { _ref: 'image-ref' } },
        upworkUrl: 'https://upwork.com/smith',
        specialties: ['AI', 'Infiltration'],
      },
    ];

    (client.fetch as jest.Mock).mockResolvedValue(mockAgents);

    const agents = await getAgents();

    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('*[_type == "agent"]'));
    expect(agents).toEqual(mockAgents);
  });
});
