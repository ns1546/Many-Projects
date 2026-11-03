import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ status: "UNAUTHENTICATED" });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
        isBanned: true,
        banReason: true,
        activeSessionToken: true,
      },
    });

    if (!user) {
      return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
    }

    // 1. Check if user was banned by Admin
    if (user.isBanned) {
      return NextResponse.json({
        status: "BANNED",
        reason: user.banReason || "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে।",
      }, { status: 403 });
    }

    // 2. Check Single-Device Lock (Conflict detection)
    const clientSessionToken = (session.user as any).sessionToken;
    if (clientSessionToken && user.activeSessionToken && clientSessionToken !== user.activeSessionToken) {
      // Log multiple device access incident
      try {
        await db.securityIncident.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            type: "MULTIPLE_DEVICE_CONFLICT",
            details: "অন্য কোনো ডিভাইস থেকে এই অ্যাকাউন্টে লগইন করা হয়েছে।",
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown",
            userAgent: request.headers.get("user-agent") || "Unknown",
          },
        });
      } catch (e) {}

      return NextResponse.json({
        status: "DEVICE_CONFLICT",
        message: "আপনার অ্যাকাউন্টটিতে অন্য একটি ডিভাইস থেকে লগইন করা হয়েছে। একই সাথে একাধিক ডিভাইসে কোর্স দেখা নিষিদ্ধ।",
      }, { status: 409 });
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    console.error("Verify session error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
