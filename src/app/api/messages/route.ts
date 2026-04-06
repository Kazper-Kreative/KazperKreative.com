import { type NextRequest, NextResponse } from 'next/server';
import { getMessagesByJobId, sendMessage } from '@/sanity/lib/messages';

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ message: 'jobId is required.' }, { status: 400 });
  }

  try {
    const messages = await getMessagesByJobId(jobId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Failed to fetch messages.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobId, sender, content } = await request.json();

    if (!jobId || !sender || !content) {
      return NextResponse.json({ message: 'jobId, sender, and content are required.' }, { status: 400 });
    }

    const result = await sendMessage(jobId, sender, content);
    return NextResponse.json({ success: true, id: result._id });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ message: 'Failed to send message.' }, { status: 500 });
  }
}
