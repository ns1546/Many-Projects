import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const lessons = await prisma.lesson.findMany({ select: { id: true, title: true, videoUrl: true } });
  console.log(JSON.stringify(lessons, null, 2));
}
main().finally(() => prisma.$disconnect());

