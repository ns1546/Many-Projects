import { sendMetaCapiEvent } from "@/lib/meta-capi";
import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { verifyUddoktaPayPayment } from "@/lib/uddoktapay";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoiceId = body.invoice_id;

    if (!invoiceId) {
      return NextResponse.json({ message: "Invoice ID missing" }, { status: 400 });
    }

    const verification = await verifyUddoktaPayPayment(invoiceId);

    if (verification.status === "COMPLETED") {
      const courseId = verification.metadata?.courseId;
      const userId = verification.metadata?.userId;
      const orderId = verification.metadata?.orderId;

      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: {
            status: "COMPLETED",
            trxId: verification.transaction_id || invoiceId,
            updatedAt: new Date(),
          },
        }).catch(() => {});
      }

      if (courseId && userId) {
        const existingEnrollment = await db.enrollment.findUnique({
          where: {
            userId_courseId: { userId, courseId }
          },
        });

        if (!existingEnrollment) {
          await db.enrollment.create({
            data: {
              id: crypto.randomUUID(),
              userId,
              courseId,
              progress: 0,
              updatedAt: new Date(),
            },
          });
        }
      }

            // Dispatch Server-Side Meta Conversion API (CAPI) Purchase event
      const course = courseId ? await db.course.findUnique({ where: { id: courseId }, select: { title: true, price: true } }) : null;
      const user = userId ? await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true, phone: true } }) : null;

      await sendMetaCapiEvent({
        eventName: "Purchase",
        eventId: `purchase_${orderId || invoiceId}`,
        userData: {
          email: user?.email,
          phone: user?.phone,
          firstName: user?.name,
        },
        customData: {
          currency: "BDT",
          value: Number(verification.amount) || course?.price || 0,
          content_name: course?.title || "Online Course",
          content_ids: courseId ? [courseId] : [],
          content_type: "product",
          order_id: orderId || invoiceId,
        },
      }).catch(err => console.error("[Meta CAPI Webhook Error]", err));

      return NextResponse.json({ status: "success", message: "Enrolled successfully" });
    }

    return NextResponse.json({ status: "ignored", message: "Payment not completed" });
  } catch (error) {
    console.error("[UddoktaPay Webhook Error]:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
