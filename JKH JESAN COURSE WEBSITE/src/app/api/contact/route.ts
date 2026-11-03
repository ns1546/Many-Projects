import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ message: "সব তথ্য প্রদান করা আবশ্যক" }, { status: 400 });
    }

    const contactMessage = await db.contactMessage.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        message
      }
    });

    return NextResponse.json({ message: "মেসেজ সফলভাবে পাঠানো হয়েছে!", data: contactMessage }, { status: 201 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি, পরে আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
