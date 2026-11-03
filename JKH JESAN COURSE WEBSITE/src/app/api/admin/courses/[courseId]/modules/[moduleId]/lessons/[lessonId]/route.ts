import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { invalidateCoursesCache } from "@/lib/cache";

export async function DELETE(req: Request, context: { params: Promise<{ courseId: string, moduleId: string, lessonId: string }> }) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const admin = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ message: "অনুমতি নেই" }, { status: 403 });
    }

    // Delete progress for this lesson first
    await db.lessonProgress.deleteMany({
      where: { lessonId: params.lessonId }
    });

    await db.lesson.update({
      where: { id: params.lessonId },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    invalidateCoursesCache();

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ courseId: string, moduleId: string, lessonId: string }> }) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const admin = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ message: "অনুমতি নেই" }, { status: 403 });
    }

    const { title, description, videoUrl, duration, resources, isFree } = await req.json();

    const updatedLesson = await db.lesson.update({
      where: { id: params.lessonId },
      data: {
        title,
        description,
        videoUrl,
        duration,
        resources,
        isFree,
        updatedAt: new Date()
      },
    });

    invalidateCoursesCache();

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
