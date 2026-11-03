import { NextResponse } from "next/server";
import { getCachedPublicCourses } from "@/lib/cache";

export const revalidate = 60;

export async function GET() {
  try {
    const courses = await getCachedPublicCourses();
    const response = NextResponse.json(courses);
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("Public courses fetch error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
