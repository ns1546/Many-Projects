import { prisma as db } from "@/lib/prisma";
import TrashClient from "./TrashClient";

export default async function AdminTrashPage() {
  const deletedCourses = await db.course.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: 'desc' }
  });

  const deletedModules = await db.module.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: 'desc' },
    include: {
      course: { select: { title: true } }
    }
  });

  const deletedLessons = await db.lesson.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: 'desc' },
    include: {
      module: {
        include: {
          course: { select: { title: true } }
        }
      }
    }
  });

  return (
    <TrashClient 
      courses={deletedCourses} 
      modules={deletedModules} 
      lessons={deletedLessons} 
    />
  );
}
