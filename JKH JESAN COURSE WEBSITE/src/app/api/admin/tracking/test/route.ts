import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admin = await db.user.findUnique({ where: { email: session.user.email } });
    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { pixelId, capiToken, testCode } = body;

    // Temporarily apply custom credentials if supplied in test request
    if (pixelId) process.env.FACEBOOK_PIXEL_ID = pixelId;
    if (capiToken) process.env.FACEBOOK_CAPI_ACCESS_TOKEN = capiToken;
    if (testCode) process.env.FACEBOOK_TEST_EVENT_CODE = testCode;

    const result = await sendMetaCapiEvent({
      eventName: "PageView",
      eventSourceUrl: "https://evorise.media/admin/tracking",
      userData: {
        clientIp: "103.145.10.1",
        clientUserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      customData: {
        content_name: "Admin CAPI Connection Test",
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
