import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, projectType, budget, description } = body;

    // Basic validation
    if (!name || !email || !projectType || !budget || !description) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not defined');
      return NextResponse.json({ message: 'Notification service is not configured.' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #333; border-radius: 8px; background-color: #050505; color: #fff;">
        <h1 style="color: #8B5CF6;">Discovery Portal: New Lead</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Budget Range:</strong> ${budget}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #111; border-radius: 4px;">
          <p style="margin-top: 0; color: #8B5CF6;"><strong>Description:</strong></p>
          <p style="white-space: pre-wrap;">${description}</p>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          Kazper Kreative Discovery System // ${new Date().toISOString()}
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Discovery Portal <noreply@kazperkreative.com>',
      to: 'mason@kazperkreative.com',
      subject: `[Discovery] ${projectType} - ${name}`,
      html: emailHtml,
    });

    // TODO: If SANITY_WRITE_TOKEN is available, save lead to Sanity here.

    return NextResponse.json({ 
      message: 'Discovery session initialized successfully.',
      status: 'success' 
    });

  } catch (error) {
    console.error('Error processing discovery submission:', error);
    return NextResponse.json({ message: 'Failed to initialize discovery session.' }, { status: 500 });
  }
}
