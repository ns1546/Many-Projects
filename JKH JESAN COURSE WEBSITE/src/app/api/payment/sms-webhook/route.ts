import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 100% Automated SMS Webhook Receiver (The "Ghost Gateway" Engine)
 * 
 * Set your Android SMS Forwarder / MacroDroid to forward incoming SMS from bKash / 16167
 * to: POST https://yourdomain.com/api/payment/sms-webhook
 * Headers: Content-Type: application/json
 * Body: { "text": "%SMS_BODY%", "sender": "%SMS_FROM%" }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const smsText = (body.text || body.message || body.body || "").toString();
    const smsSender = (body.sender || body.from || "").toString();

    if (!smsText) {
      return NextResponse.json({ message: "No SMS text provided" }, { status: 400 });
    }

    // 1. Extract TrxID
    const trxMatch = smsText.match(/(?:TrxID|TxnId|Trx Id|Txn ID|Transaction ID|TxnID)[:\s]*([A-Za-z0-9]{8,12})/i);
    const trxId = trxMatch ? trxMatch[1].toUpperCase().trim() : null;

    // 2. Extract Amount
    const amountMatch = smsText.match(/(?:Tk|TK|BDT|amount of Tk\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    const rawAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;

    // 3. Extract Sender Phone
    const phoneMatch = smsText.match(/(?:from|From|sender|Sender)[:\s]*(01[3-9]\d{8})/i);
    const senderPhone = phoneMatch ? phoneMatch[1] : null;

    if (!trxId) {
      return NextResponse.json({ 
        received: true, 
        matched: false, 
        reason: "No TrxID found in message" 
      });
    }

    // Check if an order already exists with this TrxID
    const matchingOrder = await db.order.findFirst({
      where: { trxId: trxId },
      include: { course: true }
    });

    if (matchingOrder && matchingOrder.status === "PENDING") {
      // Auto-approve the order immediately!
      await db.$transaction(async (tx: any) => {
        await tx.order.update({
          where: { id: matchingOrder.id },
          data: {
            status: "COMPLETED",
            rejectionReason: null,
            updatedAt: new Date()
          }
        });

        // Ensure enrollment is permanent
        await tx.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: matchingOrder.userId,
              courseId: matchingOrder.courseId
            }
          },
          create: {
            id: crypto.randomUUID(),
            userId: matchingOrder.userId,
            courseId: matchingOrder.courseId,
            updatedAt: new Date()
          },
          update: {}
        });
      });

      try {
        revalidatePath(`/courses/${matchingOrder.course.slug}`);
        revalidatePath("/dashboard");
        revalidatePath("/admin/orders");
      } catch (e) {
        // Non-critical
      }

      return NextResponse.json({
        success: true,
        autoApproved: true,
        orderId: matchingOrder.id,
        trxId,
        amount: rawAmount
      });
    }

    return NextResponse.json({
      received: true,
      autoApproved: false,
      trxId,
      amount: rawAmount,
      message: matchingOrder ? "Order already processed" : "Order not yet submitted by student"
    });

  } catch (error: any) {
    console.error("SMS Webhook error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
