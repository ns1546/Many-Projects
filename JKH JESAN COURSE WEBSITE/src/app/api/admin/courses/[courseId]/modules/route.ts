import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { invalidateCoursesCache } from "@/lib/cache";

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
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

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "মডিউলের নাম আবশ্যক" }, { status: 400 });
    }

    // Get the highest order to put this at the end
    const lastModule = await db.module.findFirst({
      where: { courseId: courseId },
      orderBy: { order: 'desc' }
    });
    
    const nextOrder = lastModule ? lastModule.order + 1 : 0;

    const newModule = await db.module.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        order: nextOrder,
        courseId: courseId,
        updatedAt: new Date()
      }
    });

    invalidateCoursesCache();

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
