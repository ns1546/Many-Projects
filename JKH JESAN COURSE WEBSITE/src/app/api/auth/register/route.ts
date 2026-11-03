import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // Max 5 registrations per minute per IP
    const isAllowed = await checkRateLimit(ip, 5, 60000);
    if (!isAllowed) {
      return NextResponse.json({ message: "অতিরিক্ত অনুরোধ করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।" }, { status: 429 });
    }

    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(phone ? [{ phone: phone.trim() }] : [])
        ]
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "এই ইমেইল বা ফোন নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট খোলা আছে" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If this is the very first user in the database, make them an ADMIN
    const userCount = await db.user.count();
    const role = userCount === 0 ? "ADMIN" : "STUDENT";

    // Create user
    const newUser = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        password: hashedPassword,
        role,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে", user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
