import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { createUddoktaPayCheckout } from "@/lib/uddoktapay";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন (Login Required)" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ message: "কোর্স আইডি পাওয়া যায়নি" }, { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ message: "কোর্স পাওয়া যায়নি" }, { status: 404 });
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ message: "ইউজার একাউন্ট পাওয়া যায়নি" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: "আপনি ইতিমধ্যে এই কোর্সে এনরোল্ড আছেন" }, { status: 400 });
    }

    const effectivePrice = course.discountPrice && course.discountPrice < course.price 
      ? course.discountPrice 
      : course.price;

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const appUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`).replace(/\/+$/, "");

    // Create pending order in DB
    const order = await db.order.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        courseId: course.id,
        amount: effectivePrice,
        paymentMethod: "UddoktaPay",
        status: "PENDING",
        updatedAt: new Date(),
      },
    });

    const paymentResponse = await createUddoktaPayCheckout({
      fullName: user.name || "Student",
      email: user.email || session.user.email || "student@example.com",
      amount: effectivePrice,
      metadata: {
        courseId: course.id,
        userId: user.id,
        orderId: order.id,
      },
      redirectUrl: `${appUrl}/api/payment/uddoktapay/callback?orderId=${order.id}`,
      cancelUrl: `${appUrl}/checkout/${course.id}`,
      webhookUrl: `${appUrl}/api/payment/uddoktapay/webhook`,
    });

    if (paymentResponse.status && paymentResponse.payment_url) {
      return NextResponse.json({ paymentUrl: paymentResponse.payment_url });
    } else {
      return NextResponse.json(
        { message: paymentResponse.message || "UddoktaPay গেটওয়ে সংযোগে সমস্যা হয়েছে।" },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("[UddoktaPay Create Error]:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি, কিছুক্ষণ পর আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
