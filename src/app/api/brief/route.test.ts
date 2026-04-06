/**
 * @jest-environment node
 */
import { POST } from './route';

const mockCreate = jest.fn();

jest.mock('@/sanity/lib/client', () => ({
  client: { create: (...args: unknown[]) => mockCreate(...args) },
}));

function makeRequest(body: Record<string, string>) {
  return new Request('http://localhost:3000/api/brief', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/brief', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a job document in Sanity and returns success', async () => {
    mockCreate.mockResolvedValueOnce({ _id: 'job-123' });

    const res = await POST(makeRequest({ title: 'New App', description: 'Build it', contact: 'me@test.com' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe('job-123');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: 'job',
        title: 'New App',
        status: 'PENDING',
      })
    );
  });

  it('returns 500 when Sanity create fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Sanity error'));

    const res = await POST(makeRequest({ title: 'Fail', description: 'x', contact: 'x' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
