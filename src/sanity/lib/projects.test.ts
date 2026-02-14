import { getProjectBySlug } from './projects';
import { client } from './client';

// Mock sanity client
jest.mock('./client', () => ({
  client: {
    fetch: jest.fn(),
  },
}));

describe('projects utility', () => {
  it('fetches a single project by slug from sanity', async () => {
    const mockProject = {
      title: 'Test Project',
      slug: { current: 'test-project' },
      category: 'Game Dev',
      description: 'A test project.',
      technicalChallenge: [],
      solutionArchitecture: [],
      impactMetrics: [],
      gallery: [],
      interactiveMetadata: '{}',
    };

    (client.fetch as jest.Mock).mockResolvedValue(mockProject);

    const project = await getProjectBySlug('test-project');

    expect(client.fetch).toHaveBeenCalledWith(
      expect.stringContaining('*[_type == "project" && slug.current == $slug][0]'),
      { slug: 'test-project' }
    );
    expect(project).toEqual(mockProject);
  });
});
