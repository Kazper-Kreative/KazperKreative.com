/**
 * @jest-environment node
 */
import { POST } from './route';
import { NextRequest } from 'next/server';

const mockCreate = jest.fn();

jest.mock('@/sanity/lib/client', () => ({
  writeClient: { create: (...args: unknown[]) => mockCreate(...args) },
}));

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/applicants', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/applicants', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ name: 'Jane' }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toContain('required');
  });

  it('creates an applicant document and returns success', async () => {
    mockCreate.mockResolvedValueOnce({ _id: 'app-123' });

    const res = await POST(makeRequest({
      name: 'Jane',
      email: 'jane@test.com',
      role: 'Full-Stack Dev',
      bio: 'I build things.',
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe('app-123');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ _type: 'applicant', name: 'Jane', status: 'PENDING_REVIEW' })
    );
  });

  it('returns 500 on Sanity error', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Sanity down'));

    const res = await POST(makeRequest({
      name: 'Jane',
      email: 'jane@test.com',
      role: 'Dev',
      bio: 'Hi',
    }));
    expect(res.status).toBe(500);
  });
});
