import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withSelfHealing } from "@/lib/self-healing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body.token ? String(body.token).trim() : "";
    const newPassword = body.password ? String(body.password) : "";

    if (!token || !newPassword) {
      return NextResponse.json({ message: "টোকেন এবং নতুন পাসওয়ার্ড প্রদান করুন" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }

    // Verify token validity and expiration
    const resetRecord = await withSelfHealing(async () => {
      return await db.passwordResetToken.findUnique({
        where: { token }
      });
    });

    if (!resetRecord) {
      return NextResponse.json({ message: "পাসওয়ার্ড রিসেট লিংকটি ভুল বা অকার্যকর" }, { status: 400 });
    }

    if (new Date() > new Date(resetRecord.expiresAt)) {
      // Clean up expired token
      await db.passwordResetToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json({ message: "পাসওয়ার্ড রিসেট লিংকের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন লিংকের জন্য আবেদন করুন।" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and invalidate tokens
    await withSelfHealing(async () => {
      await db.user.update({
        where: { email: resetRecord.email },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        }
      });

      await db.passwordResetToken.deleteMany({
        where: { email: resetRecord.email }
      });
    });

    return NextResponse.json({
      status: "success",
      message: "আপনার পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"
    });
  } catch (error: any) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ message: "পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে, পরে চেষ্টা করুন" }, { status: 500 });
  }
}
