import { notFound, redirect } from "next/navigation";
import { getCachedCourseById } from "@/lib/cache";

interface LearnRootProps {
  params: Promise<{ courseId: string }>;
}

export default async function LearnCourseRootPage({ params }: LearnRootProps) {
  const { courseId } = await params;

  const course = await getCachedCourseById(courseId);

  if (!course || course.isDeleted) {
    notFound();
  }

  // Find the first available lesson and redirect directly to it
  for (const courseModule of course.modules) {
    if (courseModule.lessons.length > 0) {
      redirect(`/learn/${course.id}/${courseModule.lessons[0].id}`);
    }
  }

  // If no lessons exist yet
  redirect(`/courses/${course.slug}`);
}
