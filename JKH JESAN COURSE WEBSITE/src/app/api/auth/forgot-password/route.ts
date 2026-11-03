import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import crypto from "crypto";
import { withSelfHealing } from "@/lib/self-healing";
import { sendPasswordResetEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email ? String(body.email).toLowerCase().trim() : "";

    if (!email) {
      return NextResponse.json({ message: "দয়া করে আপনার ইমেইল এড্রেস দিন" }, { status: 400 });
    }

    const user = await withSelfHealing(async () => {
      return await db.user.findFirst({
        where: {
          OR: [
            { email },
            { phone: email }
          ]
        }
      });
    });

    // Uniform security response to prevent user enumeration
    const successMessage = "যদি এই ইমেইল বা ফোন নম্বরে অ্যাকাউন্ট থাকে, তবে পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন।";

    if (!user || !user.email) {
      return NextResponse.json({ message: successMessage });
    }

    // Generate secure 32-byte hex token with a strict 15-minute expiration
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate stale tokens and persist the new token
    await withSelfHealing(async () => {
      await db.passwordResetToken.deleteMany({
        where: { email: user.email! }
      });

      await db.passwordResetToken.create({
        data: {
          email: user.email!,
          token,
          expiresAt,
        }
      });
    });

    // Deliver email securely directly to student inbox — token is NEVER returned in response JSON
    try {
      await sendPasswordResetEmail({
        to: user.email!,
        token,
        userName: user.name || undefined,
      });
    } catch (mailErr) {
      console.error("Failed to dispatch password reset email:", mailErr);
    }

    return NextResponse.json({
      message: successMessage,
    });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json({ message: "সার্ভারে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন" }, { status: 500 });
  }
}
