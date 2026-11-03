import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const admin = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ message: "অনুমতি নেই" }, { status: 403 });
    }

    const { type, id, action } = await req.json();

    if (!type || !id || !action) {
      return NextResponse.json({ message: "সঠিক তথ্য দিন" }, { status: 400 });
    }

    if (action === "restore") {
      if (type === "course") {
        await db.course.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      } else if (type === "module") {
        await db.module.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      } else if (type === "lesson") {
        await db.lesson.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      }
      return NextResponse.json({ message: "রিস্টোর সম্পন্ন হয়েছে" });
    } else if (action === "delete") {
      if (type === "course") {
        // hard delete cascade
        await db.course.delete({ where: { id } });
      } else if (type === "module") {
        await db.module.delete({ where: { id } });
      } else if (type === "lesson") {
        await db.lesson.delete({ where: { id } });
      }
      return NextResponse.json({ message: "স্থায়ীভাবে ডিলিট করা হয়েছে" });
    }

    return NextResponse.json({ message: "অবৈধ অ্যাকশন" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
