const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runBackup() {
  console.log('🔄 Starting complete local database backup...');
  const startTime = Date.now();

  try {
    const [
      users,
      instructors,
      categories,
      courses,
      modules,
      lessons,
      lessonProgresses,
      enrollments,
      orders,
      settings,
      banners,
      faqs,
      testimonials,
      contactMessages,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.instructor.findMany(),
      prisma.courseCategory.findMany(),
      prisma.course.findMany(),
      prisma.module.findMany(),
      prisma.lesson.findMany(),
      prisma.lessonProgress.findMany(),
      prisma.enrollment.findMany(),
      prisma.order.findMany(),
      prisma.setting.findMany(),
      prisma.banner.findMany(),
      prisma.fAQ.findMany(),
      prisma.testimonial.findMany(),
      prisma.contactMessage.findMany(),
    ]);

    const backupData = {
      metadata: {
        createdAt: new Date().toISOString(),
        version: "1.0.0",
        totalRecords: {
          users: users.length,
          courses: courses.length,
          modules: modules.length,
          lessons: lessons.length,
          lessonProgresses: lessonProgresses.length,
          enrollments: enrollments.length,
          orders: orders.length,
          banners: banners.length,
          settings: settings.length,
          categories: categories.length,
          instructors: instructors.length,
          faqs: faqs.length,
          testimonials: testimonials.length,
          contactMessages: contactMessages.length,
        },
      },
      data: {
        users,
        instructors,
        categories,
        courses,
        modules,
        lessons,
        lessonProgresses,
        enrollments,
        orders,
        settings,
        banners,
        faqs,
        testimonials,
        contactMessages,
      },
    };

    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.json`;
    const filePath = path.join(backupsDir, fileName);
    const latestPath = path.join(backupsDir, 'latest.json');

    const jsonContent = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    fs.writeFileSync(latestPath, jsonContent, 'utf-8');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const sizeKB = (Buffer.byteLength(jsonContent, 'utf-8') / 1024).toFixed(2);

    console.log(`✅ Backup successfully created in ${duration}s!`);
    console.log(`📁 File: backups/${fileName} (${sizeKB} KB)`);
    console.log(`📁 Latest: backups/latest.json`);
    console.log(`📊 Total: ${users.length} Users, ${courses.length} Courses, ${lessons.length} Lessons, ${orders.length} Orders`);

    return { success: true, fileName, filePath, sizeKB, timestamp: backupData.metadata.createdAt };
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runBackup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runBackup };
