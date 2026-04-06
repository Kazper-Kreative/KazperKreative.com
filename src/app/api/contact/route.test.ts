/**
 * @jest-environment node
 */
import { POST } from './route';
import { NextRequest } from 'next/server';

const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

function makeRequest(body: Record<string, string>) {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/contact', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: 'test-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('sends email and returns success', async () => {
    mockSend.mockResolvedValueOnce({ id: 'email-1' });

    const res = await POST(makeRequest({ name: 'John', email: 'john@test.com', message: 'Hello' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toContain('sent successfully');
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(String),
        subject: 'New message from John',
      })
    );
  });

  it('returns 500 when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;

    const res = await POST(makeRequest({ name: 'John', email: 'john@test.com', message: 'Hi' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toContain('not configured');
  });

  it('returns 500 when email send fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('Send failed'));

    const res = await POST(makeRequest({ name: 'John', email: 'john@test.com', message: 'Hi' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toContain('error');
  });
});
