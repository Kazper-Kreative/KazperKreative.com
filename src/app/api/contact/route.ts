import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();

  try {
    const emailHtml = `
      <div>
        <h1>New message from ${name}</h1>
        <p>
          From: ${name} (${email})
        </p>
        <p>${message}</p>
      </div>
    `;

    await resend.emails.send({
      // TODO: Replace with your own email address
      from: 'Kazper Kreative <noreply@kazperkreative.com>',
      // TODO: Replace with your own email address
      to: 'mason@kazperkreative.com',
      subject: `New message from ${name}`,
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'There was an error sending your message.' }, { status: 500 });
  }
}
