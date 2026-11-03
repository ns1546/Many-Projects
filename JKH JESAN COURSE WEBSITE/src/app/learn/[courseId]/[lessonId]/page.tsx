import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import LearnClient from "./LearnClient";

export default async function LearnPage({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/learn/${courseId}/${lessonId}`);
  }

  const [user, course] = await Promise.all([
    db.user.findUnique({
      where: { email: session.user.email },
      include: {
        enrollments: true,
        lessonProgresses: true,
      },
    }),
    db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          where: { isDeleted: false },
          include: {
            lessons: {
              where: { isDeleted: false },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Check enrollment
  const isEnrolled = user.enrollments.some((e: any) => e.courseId === courseId);
  if (!isEnrolled && user.role !== "ADMIN") {
    redirect(`/dashboard`); // Redirect to dashboard if not enrolled
  }

  if (!course) {
    notFound();
  }

  // Find current lesson
  let currentLesson = null;
  let nextLesson = null;
  let prevLesson = null;
  let allLessons: any[] = [];

  // Flatten lessons for easy next/prev calculation
  course.modules.forEach((module: any) => {
    module.lessons.forEach((lesson: any) => {
      allLessons.push(lesson);
    });
  });

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  if (currentIndex !== -1) {
    currentLesson = allLessons[currentIndex];
    if (currentIndex > 0) prevLesson = allLessons[currentIndex - 1];
    if (currentIndex < allLessons.length - 1) nextLesson = allLessons[currentIndex + 1];
  } else {
    // If lesson not found, redirect to first lesson
    if (allLessons.length > 0) {
      redirect(`/learn/${courseId}/${allLessons[0].id}`);
    } else {
      notFound();
    }
  }

  // Calculate progress
  const completedLessonIds = (user.lessonProgresses || [])
    .filter((p: any) => p.completed && allLessons.some(al => al.id === p.lessonId))
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
      userEmail={user.email!}
    />
  );
}
