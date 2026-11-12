import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

// Zod Validation Schema for Semi-Automatic Checkout (bKash, Nagad & BRAC Bank Transfer)
const checkoutSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  paymentMethod: z.enum([
    "bKash", "Nagad", "Bank", "BankTransfer", "BRAC Bank",
    "bkash", "nagad", "bank", "banktransfer", "bank_transfer"
  ]),
  trxId: z.string().min(4, "সঠিক Transaction ID বা ব্যাংক রেফারেন্স প্রদান করুন").max(50),
  senderPhone: z.string().min(3, "সঠিক মোবাইল নম্বর বা ব্যাংক একাউন্ট বিবরণ প্রদান করুন").max(80),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // Max 10 checkout attempts per minute per IP
    const isAllowed = await checkRateLimit(ip, 10, 60000);
    if (!isAllowed) {
      return NextResponse.json({ message: "অতিরিক্ত অনুরোধ করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।" }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "কোর্সটি কিনতে প্রথমে লগইন করা প্রয়োজন (Login Required)" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = checkoutSchema.safeParse(body);

    if (!validatedData.success) {
      const firstError = Object.values(validatedData.error.flatten().fieldErrors)[0]?.[0];
      return NextResponse.json(
        { message: firstError || "ফর্মের তথ্য সঠিক নয়" },
        { status: 400 }
      );
    }

    let { courseId, paymentMethod, trxId, senderPhone } = validatedData.data;

    // Normalize TrxID: uppercase, remove any extraneous spaces/characters
    trxId = trxId.toUpperCase().trim().replace(/[^A-Z0-9\-_]/g, "");
    
    const lowerMethod = paymentMethod.toLowerCase();
    const normalizedMethod = lowerMethod.includes("bkash")
      ? "bKash"
      : lowerMethod.includes("nagad")
      ? "Nagad"
      : "Bank Transfer";

    // Clean sender phone / account info
    const phoneMatch = senderPhone.match(/(01[3-9]\d{8})$/);
    if (phoneMatch) {
      senderPhone = phoneMatch[1];
    } else {
      senderPhone = senderPhone.trim();
    }

    // ── 1. STRICT STRUCTURAL VALIDATION FOR PAYMENT METHOD ──
    if (normalizedMethod === "bKash") {
      // bKash TrxID is ALWAYS exactly 10 alphanumeric characters
      if (trxId.length !== 10) {
        return NextResponse.json({
          message: `ভুল ট্রানজেকশন আইডি! বিকাশ (bKash) Transaction ID অবশ্যই ১০ অক্ষরের হতে হবে (আপনার দেওয়া TrxID ${trxId.length} অক্ষরের)।`
        }, { status: 400 });
      }

      // bKash TrxID must contain both letters and digits (e.g. BKI10928AS, BL79A2K49Q)
      const hasLetter = /[A-Z]/.test(trxId);
      const hasDigit = /[0-9]/.test(trxId);
      if (!hasLetter || !hasDigit) {
        return NextResponse.json({
          message: "ভুল বিকাশ TrxID ফরম্যাট! বিকাশ TrxID-এ অবশ্যই ইংরেজি বড় হাতের অক্ষর ও সংখ্যা উভয়ই থাকতে হবে (যেমন: BL79A2K49Q)।"
        }, { status: 400 });
      }

      // Reject repetitive dummy inputs (e.g. AAAAAAAAAA, 0000000000, 1234567890)
      if (/^(.)\1{9}$/.test(trxId) || trxId === "1234567890" || trxId === "0123456789") {
        return NextResponse.json({
          message: "অকার্যকর বা ডামি TrxID! অনুগ্রহ করে পেমেন্ট করার পর বিকাশ থেকে পাওয়া আসল TrxID দিন।"
        }, { status: 400 });
      }

      // Sender Phone validation for bKash
      if (!/^01[3-9]\d{8}$/.test(senderPhone)) {
        return NextResponse.json({
          message: "ভুল প্রেরক নম্বর! অনুগ্রহ করে সঠিক ১১ ডিজিটের বিকাশ মোবাইল নম্বর দিন (যেমন: 01841411474)।"
        }, { status: 400 });
      }
      if (/^01[3-9](\d)\1{7}$/.test(senderPhone) || senderPhone === "01234567890") {
        return NextResponse.json({
          message: "অকার্যকর মোবাইল নম্বর! আপনার ব্যবহৃত আসল ১১ ডিজিটের বিকাশ নম্বর দিন।"
        }, { status: 400 });
      }
    } else if (normalizedMethod === "Nagad") {
      // Nagad TrxID is ALWAYS exactly 8 alphanumeric characters
      if (trxId.length !== 8) {
        return NextResponse.json({
          message: `ভুল ট্রানজেকশন আইডি! নগদ (Nagad) Transaction ID অবশ্যই ৮ অক্ষরের হতে হবে (আপনার দেওয়া TrxID ${trxId.length} অক্ষরের)।`
        }, { status: 400 });
      }

      // Reject repetitive dummy inputs
      if (/^(.)\1{7}$/.test(trxId) || trxId === "12345678") {
        return NextResponse.json({
          message: "অকার্যকর বা ডামি TrxID! অনুগ্রহ করে পেমেন্ট করার পর নগদ থেকে পাওয়া আসল TrxID দিন।"
        }, { status: 400 });
      }

      // Sender Phone validation for Nagad
      if (!/^01[3-9]\d{8}$/.test(senderPhone)) {
        return NextResponse.json({
          message: "ভুল প্রেরক নম্বর! অনুগ্রহ করে সঠিক ১১ ডিজিটের নগদ মোবাইল নম্বর দিন (যেমন: 01841411474)।"
        }, { status: 400 });
      }
      if (/^01[3-9](\d)\1{7}$/.test(senderPhone) || senderPhone === "01234567890") {
        return NextResponse.json({
          message: "অকার্যকর মোবাইল নম্বর! আপনার ব্যবহৃত আসল ১১ ডিজিটের নগদ নম্বর দিন।"
        }, { status: 400 });
      }
    } else {
      // ── BANK TRANSFER VALIDATION (BRAC Bank PLC) ──
      if (trxId.length < 4 || trxId.length > 40) {
        return NextResponse.json({
          message: "ভুল ব্যাংক রেফারেন্স! ব্যাংক ট্রান্সফার রেফারেন্স বা ডিপোজিট স্লিপ নম্বর কমপক্ষে ৪ অক্ষরের হতে হবে।"
        }, { status: 400 });
      }

      // Reject repetitive dummy inputs
      if (/^(.)\1{3,}$/.test(trxId) || trxId === "1234" || trxId === "12345" || trxId === "0000" || trxId === "TEST") {
        return NextResponse.json({
          message: "অকার্যকর বা ডামি রেফারেন্স! ব্যাংক থেকে প্রাপ্ত আসল Transaction Ref বা ডিপোজিট স্লিপ নম্বর দিন।"
        }, { status: 400 });
      }

      // Sender info for Bank: can be sender's bank account name, account number, or contact phone
      if (senderPhone.length < 3) {
        return NextResponse.json({
          message: "প্রেরকের বিবরণ প্রয়োজন! প্রেরকের একাউন্ট নাম, একাউন্ট নম্বর বা মোবাইল নম্বর দিন।"
        }, { status: 400 });
      }
    }

    const userEmail = session.user.email;

    // Atomic transaction: verify and register order as PENDING for admin review
    const result = await db.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({
        where: { email: userEmail }
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      const course = await tx.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new Error("COURSE_NOT_FOUND");
      }
      
      if (!course.published) {
        throw new Error("COURSE_NOT_AVAILABLE");
      }

      // Check if this TrxID has already been used by ANY user
      const trxExists = await tx.order.findFirst({
        where: { trxId }
      });

      if (trxExists) {
        throw new Error("TRX_ALREADY_USED");
      }

      // If user had an existing pending order for this course, delete old pending to keep clean
      const existingPendingOrder = await tx.order.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
          status: "PENDING"
        }
      });

      if (existingPendingOrder) {
        await tx.order.delete({
          where: { id: existingPendingOrder.id }
        });
      }

      // Calculate effective amount
      const effectiveAmount = course.discountPrice && course.discountPrice < course.price 
        ? course.discountPrice 
        : course.price;

      // Create Order with PENDING status for Admin verification
      const order = await tx.order.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          courseId: course.id,
          amount: effectiveAmount,
          status: "PENDING",
          paymentMethod: normalizedMethod,
          trxId,
          senderPhone,
          updatedAt: new Date(),
        }
      });

      // Grant instant provisional enrollment so paying students never face unprofessional waiting delays
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          }
        }
      });

      if (!existingEnrollment) {
        await tx.enrollment.create({
          data: {
            id: crypto.randomUUID(),
            userId: user.id,
            courseId: course.id,
            updatedAt: new Date(),
          }
        });
      }

      // Fetch first lesson for direct classroom access
      const firstModule = await tx.module.findFirst({
        where: { courseId: course.id },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            take: 1
          }
        }
      });

      const firstLessonId = firstModule?.lessons?.[0]?.id;
      const redirectUrl = firstLessonId 
        ? `/learn/${course.id}/${firstLessonId}` 
        : `/dashboard`;

      return { order, course, redirectUrl };
    });

    // Revalidate relevant pages
    try {
      revalidatePath("/dashboard");
      revalidatePath("/admin/orders");
      revalidatePath("/learn");
      revalidatePath(`/courses/${result.course.slug}`);
    } catch (e) {
      // Non-critical cache purge error
    }

    return NextResponse.json({ 
      success: true,
      message: "পেমেন্ট তথ্য সফলভাবে জমা নেওয়া হয়েছে এবং কোর্সে প্রবেশাধিকার দেওয়া হয়েছে। এখনই ক্লাস শুরু করুন!", 
      orderId: result.order.id,
      redirectUrl: result.redirectUrl
    }, { status: 201 });

  } catch (error: any) {
    console.error("Semi-automatic checkout error:", error);
    
    if (error.message === "TRX_ALREADY_USED") {
      return NextResponse.json({ 
        message: "এই Transaction ID (TrxID) টি ইতিমধ্যে ব্যবহার করা হয়েছে। অনুগ্রহ করে আপনার আসল TrxID প্রদান করুন।" 
      }, { status: 400 });
    }
    if (error.message === "COURSE_NOT_FOUND" || error.message === "COURSE_NOT_AVAILABLE") {
      return NextResponse.json({ message: "কোর্সটি বর্তমানে উপলব্ধ নয়" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "সার্ভার ত্রুটি, অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
