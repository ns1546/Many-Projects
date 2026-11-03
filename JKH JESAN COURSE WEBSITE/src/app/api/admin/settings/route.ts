import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { invalidateSettingsCache } from "@/lib/cache";
import { z } from "zod";

const settingsSchema = z.object({
  facebookPixelId: z.string().optional().nullable(),
  googleAnalyticsId: z.string().optional().nullable(),
  bkashNumber: z.string().optional().nullable(),
  nagadNumber: z.string().optional().nullable(),
  rocketNumber: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  supportEmail: z.string().optional().nullable(),
  noticeText: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন প্রয়োজন" }, { status: 401 });
    }

    const admin = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ message: "অনুমতি নেই" }, { status: 403 });
    }

    const setting = await db.setting.findUnique({ where: { id: "global" } });
    return NextResponse.json(setting || {});
  } catch (error) {
    console.error("Admin settings get error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন প্রয়োজন" }, { status: 401 });
    }

    const admin = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ message: "অনুমতি নেই" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = settingsSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { message: "অবৈধ ডাটা", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      facebookPixelId,
      googleAnalyticsId,
      bkashNumber,
      nagadNumber,
      rocketNumber,
      whatsappNumber,
      supportEmail,
      noticeText,
    } = validatedData.data;

    const updated = await db.setting.upsert({
      where: { id: "global" },
      update: {
        facebookPixelId: facebookPixelId || null,
        googleAnalyticsId: googleAnalyticsId || null,
        bkashNumber: bkashNumber || null,
        nagadNumber: nagadNumber || null,
        rocketNumber: rocketNumber || null,
        whatsappNumber: whatsappNumber || null,
        supportEmail: supportEmail || null,
        noticeText: noticeText || null,
        updatedAt: new Date(),
      },
      create: {
        id: "global",
        facebookPixelId: facebookPixelId || null,
        googleAnalyticsId: googleAnalyticsId || null,
        bkashNumber: bkashNumber || null,
        nagadNumber: nagadNumber || null,
        rocketNumber: rocketNumber || null,
        whatsappNumber: whatsappNumber || null,
        supportEmail: supportEmail || null,
        noticeText: noticeText || null,
        updatedAt: new Date(),
      },
    });

    invalidateSettingsCache();
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");

    return NextResponse.json({ message: "সেটিংস সফলভাবে সংরক্ষিত হয়েছে", setting: updated });
  } catch (error) {
    console.error("Admin settings patch error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
