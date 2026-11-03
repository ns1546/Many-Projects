import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";

export default async function LearnCourseRootPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/learn/${courseId}`);
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrollments: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isEnrolled = user.enrollments.some((e: any) => e.courseId === courseId);
  if (!isEnrolled && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const course = await db.course.findUnique({
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
  });

  if (!course || course.isDeleted) {
    notFound();
  }

  // Find the first available lesson
  for (const courseModule of course.modules) {
    if (courseModule.lessons.length > 0) {
      redirect(`/learn/${course.id}/${courseModule.lessons[0].id}`);
    }
  }

  // If no lessons exist yet
  redirect("/dashboard");
}
