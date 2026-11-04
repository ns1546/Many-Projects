import { NextResponse } from "next/server";
import { getCachedCourseById } from "@/lib/cache";

export const revalidate = 60;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const course = await getCachedCourseById(id);

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    const payload = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      discountPrice: course.discountPrice,
      duration: course.duration,
      level: course.level,
      language: course.language,
      accessType: course.accessType,
      published: course.published,
    };

    const response = NextResponse.json(payload);
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
