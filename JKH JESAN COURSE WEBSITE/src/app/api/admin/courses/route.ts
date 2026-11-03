import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { invalidateCoursesCache } from "@/lib/cache";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  thumbnail: z.string().optional(),
  introVideoUrl: z.string().optional(),
  published: z.boolean().default(false),
});

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
    const validatedData = courseSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, slug, description, price, thumbnail, introVideoUrl, published } = validatedData.data;

    const newCourse = await db.course.create({
      data: {
        id: crypto.randomUUID(),
        title,
        slug,
        description: description || "",
        price: Number(price),
        thumbnail: thumbnail || "",
        introVideoUrl: introVideoUrl || null,
        published: published || false,
        updatedAt: new Date()
      }
    });

    invalidateCoursesCache();

    return NextResponse.json({ message: "কোর্স সফলভাবে তৈরি হয়েছে", course: newCourse }, { status: 201 });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
