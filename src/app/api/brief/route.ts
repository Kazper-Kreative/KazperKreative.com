import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, contact } = body;

    // 1. Create or find the Client document based on contact (email)
    // For now, we create a new client or link to an existing one if we had auth ready
    // This is a simplified version for Phase 2 initialization
    
    const jobDoc = {
      _type: 'job',
      title,
      description,
      status: 'PENDING',
      // We will link to the client reference once we have the client lookup logic solid
    };

    const result = await client.create(jobDoc);

    return NextResponse.json({ success: true, id: result._id });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ success: false, error: 'Initialization Failed' }, { status: 500 });
  }
}
