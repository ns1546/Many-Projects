import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("id") || searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json({ message: "সার্টিফিকেট আইডি বা ইমেইল প্রয়োজন।" }, { status: 400 });
    }

    const cleanQuery = query.toUpperCase().replace(/^(EVO|JKH)-/, "");
    const parts = cleanQuery.split("-");
    const courseSubstr = parts.length >= 2 ? parts[0] : "";
    const userSubstr = parts.length >= 2 ? parts[1] : "";

    // Target search candidates using indexed queries instead of full table scan
    let whereFilter: any = {};
    if (query.includes("@")) {
      whereFilter = { user: { email: { equals: query.toLowerCase(), mode: "insensitive" } } };
    } else if (courseSubstr && userSubstr) {
      whereFilter = {
        OR: [
          {
            AND: [
              { courseId: { endsWith: courseSubstr.toLowerCase() } },
              { userId: { endsWith: userSubstr.toLowerCase() } },
            ],
          },
          {
            AND: [
              { courseId: { endsWith: courseSubstr } },
              { userId: { endsWith: userSubstr } },
            ],
          },
        ],
      };
    } else {
      whereFilter = {
        OR: [
          { id: query },
          { user: { email: { equals: query, mode: "insensitive" } } },
        ],
      };
    }

    const enrollmentInclude = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          lessonProgresses: {
            where: { completed: true },
            select: { lessonId: true },
          },
        },
      },
      course: {
        include: {
          modules: {
            where: { isDeleted: false },
            include: {
              lessons: {
                where: { isDeleted: false },
                select: { id: true },
              },
            },
          },
        },
      },
    };

    let enrollments = await db.enrollment.findMany({
      where: whereFilter,
      take: 20,
      include: enrollmentInclude,
    });

    // Fallback only if targeted query returned empty and it's a code search
    if (enrollments.length === 0 && (courseSubstr || userSubstr)) {
      enrollments = await db.enrollment.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: enrollmentInclude,
      });
    }

    // Check completion and find match
    const matchingEnrollment = enrollments.find((e) => {
      const allCourseLessonIds = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const totalLessons = allCourseLessonIds.length;
      const completedCount = e.user.lessonProgresses.filter((lp) =>
        allCourseLessonIds.includes(lp.lessonId)
      ).length;

      const isCompleted = (totalLessons > 0 && completedCount >= totalLessons) || e.progress >= 100;
      if (!isCompleted) return false;

      const generatedId = `EVO-${e.course.id.slice(-6).toUpperCase()}-${e.user.id.slice(-4).toUpperCase()}`;
      const legacyId = `JKH-${e.course.id.slice(-6).toUpperCase()}-${e.user.id.slice(-4).toUpperCase()}`;
      if (generatedId.toLowerCase() === query.toLowerCase() || legacyId.toLowerCase() === query.toLowerCase()) return true;

      if (courseSubstr && userSubstr) {
        if (
          e.course.id.toUpperCase().endsWith(courseSubstr) &&
          e.user.id.toUpperCase().endsWith(userSubstr)
        ) {
          return true;
        }
      }

      if (e.user.email?.toLowerCase() === query.toLowerCase()) return true;
      if (e.id.toLowerCase() === query.toLowerCase()) return true;

      return false;
    });

    if (!matchingEnrollment) {
      return NextResponse.json(
        { verified: false, message: "প্রদত্ত আইডি বা তথ্যের সাথে কোনো ভেরিফাইড সার্টিফিকেট মেলেনি।" },
        { status: 404 }
      );
    }

    const credentialId = `EVO-${matchingEnrollment.course.id.slice(-6).toUpperCase()}-${matchingEnrollment.user.id.slice(-4).toUpperCase()}`;

    return NextResponse.json({
      verified: true,
      credentialId,
      studentName: matchingEnrollment.user.name || "শিক্ষার্থী",
      courseTitle: matchingEnrollment.course.title,
      courseSlug: matchingEnrollment.course.slug,
      completedAt: matchingEnrollment.updatedAt || matchingEnrollment.createdAt,
      instructor: "JKH Jesan (চিফ মেন্টর)",
      institution: "EvoRise Media",
      status: "AUTHENTIC & VERIFIED",
    });
  } catch (error: any) {
    console.error("Certificate verify error:", error);
    return NextResponse.json({ message: "সার্ভার ত্রুটি, পরে আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
