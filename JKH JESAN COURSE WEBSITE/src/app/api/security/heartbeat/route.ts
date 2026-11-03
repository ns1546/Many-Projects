import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Fast JWT extraction (sub-millisecond, no DB session roundtrip)
    let email: string | undefined;
    let clientSessionToken: string | undefined;

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token?.email) {
      email = token.email as string;
      clientSessionToken = (token as any).sessionToken;
    } else {
      // Fallback to getServerSession if cookies are standard
      const session = await getServerSession(authOptions);
      email = session?.user?.email || undefined;
      clientSessionToken = (session?.user as any)?.sessionToken;
    }

    if (!email) {
      return NextResponse.json({ status: "OK", authenticated: false });
    }

    // 2. Single high-speed indexed query
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        isBanned: true,
        banReason: true,
        activeSessionToken: true,
      },
    });

    if (!user) {
      return NextResponse.json({ status: "OK" });
    }

    // 3. Ban check
    if (user.isBanned) {
      return NextResponse.json({
        error: user.banReason || "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে।",
        banned: true,
      }, { status: 403 });
    }

    // 4. Single-device lock check
    if (clientSessionToken && user.activeSessionToken && clientSessionToken !== user.activeSessionToken) {
      return NextResponse.json({
        error: "অন্য কোনো ডিভাইস থেকে এই অ্যাকাউন্টে লগইন করা হয়েছে। একই সাথে একাধিক ডিভাইসে কোর্স দেখা নিষিদ্ধ।",
        conflict: true,
      }, { status: 409 });
    }

    return NextResponse.json({ status: "OK", authenticated: true });
  } catch (error) {
    // Failsafe: never crash the client player on transient network/DB blips
    return NextResponse.json({ status: "OK" });
  }
}
