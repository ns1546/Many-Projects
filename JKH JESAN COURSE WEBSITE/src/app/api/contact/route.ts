import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ message: "নাম, ইমেইল এবং বার্তা প্রদান করা আবশ্যক" }, { status: 400 });
    }

    // Format metadata neatly into stored message body for admin view
    const formattedMessage = [
      subject ? `[বিষয়: ${subject}]` : null,
      phone ? `[ফোন/WhatsApp: ${phone}]` : null,
      "",
      message
    ].filter(line => line !== null).join("\n");

    const contactMessage = await db.contactMessage.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        message: formattedMessage
      }
    });

    return NextResponse.json({ 
      message: "মেসেজ সফলভাবে পাঠানো হয়েছে!", 
      data: contactMessage 
    }, { status: 201 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি, পরে আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
