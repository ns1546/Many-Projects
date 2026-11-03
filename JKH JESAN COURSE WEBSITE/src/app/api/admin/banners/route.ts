import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";
import { z } from "zod";

const bannerSchema = z.object({
  title: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  targetUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export async function GET(req: Request) {
  try {
    const banners = await db.banner.findMany({
      orderBy: { order: "asc" }
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Fetch banners error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "অ্যাডমিন এক্সেস প্রয়োজন" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = bannerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newBanner = await db.banner.create({
      data: validatedData.data
    });

    invalidateCache("homepage_data");

    return NextResponse.json({ message: "ব্যানার সফলভাবে তৈরি হয়েছে", banner: newBanner }, { status: 201 });
  } catch (error) {
    console.error("Create banner error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
