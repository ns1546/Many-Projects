import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";
import { z } from "zod";

const bannerSchema = z.object({
  title: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required").optional(),
  targetUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    const updatedBanner = await db.banner.update({
      where: { id: params.id },
      data: validatedData.data
    });

    invalidateCache("homepage_data");

    return NextResponse.json({ message: "ব্যানার আপডেট হয়েছে", banner: updatedBanner });
  } catch (error) {
    console.error("Update banner error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    await db.banner.delete({
      where: { id: params.id }
    });

    invalidateCache("homepage_data");

    return NextResponse.json({ message: "ব্যানার ডিলিট হয়েছে" });
  } catch (error) {
    console.error("Delete banner error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
