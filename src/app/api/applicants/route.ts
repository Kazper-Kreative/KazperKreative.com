import { type NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/sanity/lib/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, callsign, email, role, specialties, experience, portfolioUrl, bio } = body;

    if (!name || !email || !role || !bio) {
      return NextResponse.json({ message: 'Name, email, role, and bio are required.' }, { status: 400 });
    }

    const result = await writeClient.create({
      _type: 'applicant',
      name,
      callsign: callsign || undefined,
      email,
      role,
      specialties: specialties || [],
      experience: experience || undefined,
      portfolioUrl: portfolioUrl || undefined,
      bio,
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      id: result._id,
      message: 'Dossier submitted. Standby for evaluation.',
    });
  } catch (error) {
    console.error('Applicant submission error:', error);
    return NextResponse.json({ message: 'Submission failed. Try again.' }, { status: 500 });
  }
}
