import { NextResponse, NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const userSession = await getUserFromRequest(req);
    // if (!userSession || userSession.role !== 'admin') {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const { email, subject, body } = await req.json();

    if (!email || !subject || !body) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Real Email Dispatch using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use host/port for other SMTP servers
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Petopia Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: body,
    };

    // If no credentials, log the warning and simulate
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ EMAIL_USER or EMAIL_PASS not set in .env.local. Simulating email instead.");
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`\n=== ✉️ SIMULATED EMAIL ===\nTo: ${email}\nSubject: ${subject}\nBody: ${body}\n==========================\n`);
    } else {
      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}
