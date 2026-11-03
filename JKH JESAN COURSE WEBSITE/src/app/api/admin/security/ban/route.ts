import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, isBanned, reason } = await request.json();

    if (!userId) {
      return new NextResponse("User ID required", { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        isBanned: !!isBanned,
        banReason: isBanned ? reason || "নিরাপত্তা নীতি লঙ্ঘনের কারণে অ্যাকাউন্টটি স্থায়ীভাবে ব্যান করা হয়েছে।" : null,
        activeSessionToken: null, // Forces immediate logout across all devices
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Ban user error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
