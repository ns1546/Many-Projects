import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { invalidateCoursesCache } from "@/lib/cache";

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string, moduleId: string }> }) {
  try {
    const { moduleId } = await params;
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

    const { title, description, videoUrl, duration, isFree, resources } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "লেসনের নাম আবশ্যক" }, { status: 400 });
    }

    // Get the highest order to put this at the end
    const lastLesson = await db.lesson.findFirst({
      where: { moduleId: moduleId },
      orderBy: { order: 'desc' }
    });
    
    const nextOrder = lastLesson ? lastLesson.order + 1 : 0;

    const newLesson = await db.lesson.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        videoUrl,
        duration,
        resources,
        isFree: isFree || false,
        order: nextOrder,
        moduleId: moduleId,
        updatedAt: new Date()
      }
    });

    invalidateCoursesCache();

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
