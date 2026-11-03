import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "নাম প্রদান করা আবশ্যক" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
      },
    });

    return NextResponse.json({ message: "প্রোফাইল আপডেট হয়েছে", user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
