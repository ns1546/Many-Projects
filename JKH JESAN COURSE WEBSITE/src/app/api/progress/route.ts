import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ message: "Lesson ID আবশ্যক" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }

    // Upsert lesson progress
    const progress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId
        }
      },
      update: {
        completed: true,
        updatedAt: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        userId: user.id,
        lessonId: lessonId,
        completed: true,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({ message: "প্রগ্রেস আপডেট হয়েছে", progress }, { status: 200 });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
