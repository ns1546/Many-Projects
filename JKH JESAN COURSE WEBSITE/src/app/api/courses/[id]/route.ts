import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const revalidate = 60;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const course = await db.course.findUnique({
      where: { id: id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        price: true,
        discountPrice: true,
        duration: true,
        level: true,
        language: true,
        accessType: true,
        published: true,
      },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    const response = NextResponse.json(course);
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
