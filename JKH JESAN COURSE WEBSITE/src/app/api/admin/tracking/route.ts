import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admin = await db.user.findUnique({ where: { email: session.user.email } });
    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const setting = await db.setting.findUnique({ where: { id: "global" } });

    const pixelId = setting?.facebookPixelId || process.env.FACEBOOK_PIXEL_ID || "";
    const rawToken = process.env.FACEBOOK_CAPI_ACCESS_TOKEN || "";
    const testCode = process.env.FACEBOOK_TEST_EVENT_CODE || "";

    return NextResponse.json({
      pixelId,
      hasToken: Boolean(rawToken),
      // Mask token for UI security
      tokenMasked: rawToken ? `${rawToken.slice(0, 10)}••••••••••••••••••••${rawToken.slice(-6)}` : "",
      rawToken, // Provided to admin for editing
      testCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    const { pixelId, capiToken, testCode } = await req.json();

    // 1. Update DB Setting
    await db.setting.upsert({
      where: { id: "global" },
      update: {
        facebookPixelId: pixelId || null,
        updatedAt: new Date(),
      },
      create: {
        id: "global",
        facebookPixelId: pixelId || null,
        updatedAt: new Date(),
      },
    });

    // 2. Persist to .env on server securely
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    envContent = envContent
      .split("\n")
      .filter((line) => !line.startsWith("FACEBOOK_") && !line.startsWith("NEXT_PUBLIC_FACEBOOK_"))
      .join("\n");

    const newLines = [
      "",
      "# Meta (Facebook) Pixel & Server-Side Conversion API (CAPI)",
      `FACEBOOK_PIXEL_ID="${pixelId || ""}"`,
      `NEXT_PUBLIC_FACEBOOK_PIXEL_ID="${pixelId || ""}"`,
      `FACEBOOK_CAPI_ACCESS_TOKEN="${capiToken || ""}"`,
      `FACEBOOK_TEST_EVENT_CODE="${testCode || ""}"`,
      "",
    ].join("\n");

    fs.writeFileSync(envPath, envContent.trim() + newLines, "utf8");

    // Update in-memory runtime process.env
    process.env.FACEBOOK_PIXEL_ID = pixelId || "";
    process.env.FACEBOOK_CAPI_ACCESS_TOKEN = capiToken || "";
    process.env.FACEBOOK_TEST_EVENT_CODE = testCode || "";

    return NextResponse.json({ success: true, message: "ট্র্যাকিং ক্রেডেনশিয়াল সফলভাবে সংরক্ষিত হয়েছে!" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
