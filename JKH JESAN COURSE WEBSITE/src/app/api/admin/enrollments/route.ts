import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const enrollSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  courseId: z.string().min(1, "Course ID required"),
});

export async function POST(req: Request) {
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
    const validated = enrollSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ message: "অবৈধ ডাটা" }, { status: 400 });
    }

    const { userId, courseId } = validated.data;

    // Check user and course exist
    const [user, course] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.course.findUnique({ where: { id: courseId } }),
    ]);

    if (!user) {
      return NextResponse.json({ message: "ইউজার পাওয়া যায়নি" }, { status: 404 });
    }
    if (!course) {
      return NextResponse.json({ message: "কোর্স পাওয়া যায়নি" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "শিক্ষার্থী ইতিমধ্যে এই কোর্সে যুক্ত আছেন।" },
        { status: 400 }
      );
    }

    // Create Enrollment & Manual Order record atomically
    const enrollment = await db.$transaction(async (tx) => {
      const createdEnrollment = await tx.enrollment.create({
        data: {
          id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId,
          courseId,
          progress: 0,
          updatedAt: new Date(),
        },
      });

      // Create completed order record for financial & audit tracking
      await tx.order.create({
        data: {
          id: `ord_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          courseId,
          amount: course.discountPrice || course.price,
          status: "COMPLETED",
          paymentMethod: "Manual (Admin)",
          trxId: `ADMIN-GRANT-${Date.now().toString().slice(-6)}`,
          senderPhone: user.phone || "Admin Granted",
          updatedAt: new Date(),
        },
      });

      return createdEnrollment;
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return NextResponse.json({
      message: `সাফল্যের সাথে "${course.title}" কোর্সে অ্যাক্সেস দেওয়া হয়েছে!`,
      enrollment,
    });
  } catch (error) {
    console.error("Manual enroll error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    if (!userId || !courseId) {
      return NextResponse.json({ message: "userId and courseId required" }, { status: 400 });
    }

    await db.enrollment.deleteMany({
      where: { userId, courseId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return NextResponse.json({ message: "কোর্স অ্যাক্সেস সফলভাবে প্রত্যাহার করা হয়েছে।" });
  } catch (error) {
    console.error("Revoke enroll error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
