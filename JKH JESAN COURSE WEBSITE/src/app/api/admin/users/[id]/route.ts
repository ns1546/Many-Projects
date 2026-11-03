import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
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

    const { role } = await req.json();

    if (params.id === admin.id && role !== "ADMIN") {
      return NextResponse.json({ message: "আপনি নিজের অ্যাডমিন রোল পরিবর্তন করতে পারবেন না।" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
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

    if (params.id === admin.id) {
      return NextResponse.json({ message: "আপনি নিজের অ্যাকাউন্ট মুছে ফেলতে পারবেন না।" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      const adminCount = await db.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json({ message: "সিস্টেমের একমাত্র অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা সম্ভব নয়।" }, { status: 400 });
      }
    }

    await db.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
