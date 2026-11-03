import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { type, details, lessonId } = body;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown";
    const userAgent = request.headers.get("user-agent") || "Unknown";

    let dbUserId = null;
    let dbUserEmail = session?.user?.email || "Guest";

    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true },
      });
      if (user) {
        dbUserId = user.id;
        dbUserEmail = user.email!;
      }
    }

    const incident = await db.securityIncident.create({
      data: {
        userId: dbUserId,
        userEmail: dbUserEmail,
        type: type || "UNKNOWN_VIOLATION",
        details: details || null,
        lessonId: lessonId || null,
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    return NextResponse.json({ success: true, id: incident.id });
  } catch (error: any) {
    console.error("Failed to log security incident:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}
