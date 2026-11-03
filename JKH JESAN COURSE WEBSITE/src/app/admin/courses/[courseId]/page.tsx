import { prisma as db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseEditor from "./CourseEditor";

export default async function AdminCourseDetailsPage(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: {
        where: { isDeleted: false },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isDeleted: false },
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  return <CourseEditor course={course} />;
}
