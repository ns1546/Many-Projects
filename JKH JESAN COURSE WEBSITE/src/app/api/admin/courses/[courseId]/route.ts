import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { invalidateCoursesCache } from "@/lib/cache";

const updateSchema = z.object({
  published: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  discountPrice: z.coerce.number().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  introVideoUrl: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  accessType: z.string().optional(),
});

export async function PATCH(req: Request, props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "অ্যাডমিন এক্সেস প্রয়োজন" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatePayload: any = {
      ...validatedData.data,
      updatedAt: new Date(),
    };
    if (validatedData.data.accessType) {
      updatePayload.accessType = validatedData.data.accessType;
    }

    const course = await db.course.update({
      where: { id: params.courseId },
      data: updatePayload,
    });

    invalidateCoursesCache();
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${params.courseId}`);
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/");

    return NextResponse.json({ message: "কোর্স আপডেট হয়েছে", course }, { status: 200 });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "লগইন করা প্রয়োজন" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "অ্যাডমিন এক্সেস প্রয়োজন" }, { status: 403 });
    }

    await db.course.update({
      where: { id: params.courseId },
      data: { isDeleted: true, deletedAt: new Date(), published: false }
    });

    invalidateCoursesCache();
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");

    return NextResponse.json({ message: "কোর্স রিসাইকেল বিনে পাঠানো হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
