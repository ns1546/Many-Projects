import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { getCachedCourseById } from "@/lib/cache";
import LearnClient from "./LearnClient";

interface LearnPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);

  const [user, course] = await Promise.all([
    session?.user?.email
      ? db.user.findUnique({
          where: { email: session.user.email },
          include: {
            enrollments: true,
            lessonProgresses: true,
          },
        })
      : null,
    getCachedCourseById(courseId),
  ]);

  if (!course) {
    notFound();
  }

  // Flatten lessons for easy next/prev calculation & indexing
  const allLessons: any[] = [];
  course.modules.forEach((module: any) => {
    module.lessons.forEach((lesson: any) => {
      allLessons.push(lesson);
    });
  });

  if (allLessons.length === 0) {
    notFound();
  }

  // Find current lesson
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) {
    // If lesson not found, redirect to first lesson
    redirect(`/learn/${courseId}/${allLessons[0].id}`);
  }

  const currentLesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Check enrollment
  const isEnrolled = Boolean(
    user && (
      user.role === "ADMIN" || 
      user.enrollments.some((e: any) => e.courseId === courseId)
    )
  );

  // SN 21: 1 Free Preview Class for all visitors (with or without account)
  // The first class (index 0) or any lesson explicitly marked isFree is open for free trial!
  const isFreeLesson = currentIndex === 0 || Boolean(currentLesson.isFree);

  // If lesson is locked and user is not enrolled:
  const isLocked = !isEnrolled && !isFreeLesson;

  // Calculate progress
  const completedLessonIds = (user?.lessonProgresses || [])
    .filter((p: any) => p.completed && allLessons.some((al) => al.id === p.lessonId))
    .map((p: any) => p.lessonId);

  const progressPercentage = allLessons.length > 0 
    ? Math.round((completedLessonIds.length / allLessons.length) * 100) 
    : 0;

  return (
    <LearnClient 
      course={course}
      currentLesson={currentLesson}
      nextLesson={nextLesson}
      prevLesson={prevLesson}
      completedLessonIds={completedLessonIds}
      progressPercentage={progressPercentage}
      totalLessons={allLessons.length}
      userEmail={user?.email || "guest@evorisemedia.com"}
      isEnrolled={isEnrolled}
      isLocked={isLocked}
      isFreeLesson={isFreeLesson}
    />
  );
}
