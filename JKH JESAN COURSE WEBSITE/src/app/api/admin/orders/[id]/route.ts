import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const orderUpdateSchema = z.object({
  status: z.enum(["COMPLETED", "FAILED"]),
  rejectionReason: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন (Login Required)" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "অ্যাডমিন এক্সেস প্রয়োজন (Admin Access Required)" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = orderUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ message: "অবৈধ স্ট্যাটাস বা তথ্য (Invalid Request)" }, { status: 400 });
    }

    const { status, rejectionReason } = validatedData.data;

    // Execute atomic transaction
    const updatedOrder = await db.$transaction(async (tx: any) => {
      const order = await tx.order.findUnique({
        where: { id: id },
        include: { course: true, user: true }
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // 1. Update order status and rejectionReason
      const updated = await tx.order.update({
        where: { id: id },
        data: { 
          status,
          rejectionReason: status === "FAILED" 
            ? (rejectionReason || "প্রদত্ত পেমেন্ট তথ্য বা TrxID যাচাইয়ে সঠিক পাওয়া যায়নি।") 
            : null,
          updatedAt: new Date(),
        }
      });

      // 2. If approved (COMPLETED), ensure enrollment exists atomically
      if (status === "COMPLETED") {
        const existingEnrollment = await tx.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: order.courseId
            }
          }
        });

        if (!existingEnrollment) {
          await tx.enrollment.create({
            data: {
              id: crypto.randomUUID(),
              userId: order.userId,
              courseId: order.courseId,
              updatedAt: new Date(),
            }
          });
        }
      } else if (status === "FAILED") {
        // If an order is rejected (FAILED), revoke enrollment immediately
        const existingEnrollment = await tx.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: order.userId,
              courseId: order.courseId
            }
          }
        });
        
        if (existingEnrollment) {
          await tx.enrollment.delete({
            where: { id: existingEnrollment.id }
          });
        }
      }

      return { order: updated, courseSlug: order.course?.slug };
    });

    // Real-time tracking updates (Forces Next.js to update the UI instantly without crushing the server)
    try {
      revalidatePath("/admin");
      revalidatePath("/admin/orders");
      revalidatePath("/dashboard");
      revalidatePath("/learn");
      if (updatedOrder.courseSlug) {
        revalidatePath(`/courses/${updatedOrder.courseSlug}`);
      }
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({ 
      message: status === "COMPLETED" ? "অর্ডার অনুমোদিত হয়েছে" : "অর্ডার বাতিল ও অ্যাক্সেস প্রত্যাহার করা হয়েছে", 
      order: updatedOrder.order 
    });
    
  } catch (error: any) {
    console.error("Admin order update error:", error);
    if (error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ message: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
