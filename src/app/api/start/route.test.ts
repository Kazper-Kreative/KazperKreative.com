/**
 * @jest-environment node
 */
import { POST } from './route';
import { NextRequest } from 'next/server';

const mockCreate = jest.fn();
const mockSend = jest.fn();

jest.mock('@/sanity/lib/client', () => ({
  writeClient: { create: (...args: unknown[]) => mockCreate(...args) },
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/start', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validBody = {
  name: 'Jane',
  email: 'jane@test.com',
  company: 'Acme',
  projectType: 'Game Dev',
  budget: '$50k-$100k',
  description: 'Build an RPG',
};

describe('POST /api/start', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: 'test-key' };
    mockCreate.mockResolvedValue({});
    mockSend.mockResolvedValue({});
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ name: 'Jane' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toContain('Missing');
  });

  it('saves lead to Sanity and sends email', async () => {
    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe('success');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ _type: 'lead', name: 'Jane', status: 'new' })
    );
    expect(mockSend).toHaveBeenCalled();
  });

  it('continues even if Sanity save fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Sanity down'));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalled();
  });

  it('skips email when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY;

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
