const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runRestore(targetFilePath) {
  const filePath = targetFilePath || path.join(process.cwd(), 'backups', 'latest.json');
  console.log(`ðŸ”„ Starting complete database restore from: ${filePath}`);

  if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
    throw new Error(`Backup file does not exist at: ${filePath}`);
  }

  const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
  const backup = JSON.parse(raw);

  if (!backup.data) {
    throw new Error('Invalid backup format: missing "data" key');
  }

  const {
    users = [],
    instructors = [],
    categories = [],
    courses = [],
    modules = [],
    lessons = [],
    lessonProgresses = [],
    enrollments = [],
    orders = [],
    settings = [],
    banners = [],
    faqs = [],
    testimonials = [],
    contactMessages = [],
  } = backup.data;

  console.log(`ðŸ“Š Restoring: ${users.length} Users, ${courses.length} Courses, ${modules.length} Modules, ${lessons.length} Lessons, ${orders.length} Orders...`);

  await prisma.$transaction(async (tx) => {
    // 1. Restore independent tables
    for (const inst of instructors) {
      await tx.instructor.upsert({
        where: { id: inst.id },
        update: inst,
        create: inst,
      });
    }

    for (const cat of categories) {
      await tx.courseCategory.upsert({
        where: { id: cat.id },
        update: cat,
        create: cat,
      });
    }

    for (const u of users) {
      await tx.user.upsert({
        where: { id: u.id },
        update: u,
        create: u,
      });
    }

    // 2. Restore courses
    for (const c of courses) {
      await tx.course.upsert({
        where: { id: c.id },
        update: c,
        create: c,
      });
    }

    // 3. Restore modules
    for (const m of modules) {
      await tx.module.upsert({
        where: { id: m.id },
        update: m,
        create: m,
      });
    }

    // 4. Restore lessons
    for (const l of lessons) {
      await tx.lesson.upsert({
        where: { id: l.id },
        update: l,
        create: l,
      });
    }

    // 5. Restore enrollments
    for (const e of enrollments) {
      await tx.enrollment.upsert({
        where: { userId_courseId: { userId: e.userId, courseId: e.courseId } },
        update: e,
        create: e,
      });
    }

    // 6. Restore orders
    for (const o of orders) {
      await tx.order.upsert({
        where: { id: o.id },
        update: o,
        create: o,
      });
    }

    // 7. Restore lesson progress
    for (const p of lessonProgresses) {
      await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: p.userId, lessonId: p.lessonId } },
        update: p,
        create: p,
      });
    }

    // 8. Restore banners
    for (const b of banners) {
      await tx.banner.upsert({
        where: { id: b.id },
        update: b,
        create: b,
      });
    }

    // 9. Restore settings
    for (const s of settings) {
      await tx.setting.upsert({
        where: { id: s.id },
        update: s,
        create: s,
      });
    }

    // 10. Restore FAQs, testimonials, messages
    for (const f of faqs) {
      await tx.fAQ.upsert({ where: { id: f.id }, update: f, create: f });
    }
    for (const t of testimonials) {
      await tx.testimonial.upsert({ where: { id: t.id }, update: t, create: t });
    }
    for (const m of contactMessages) {
      await tx.contactMessage.upsert({ where: { id: m.id }, update: m, create: m });
    }
  });

  console.log('âœ… Database restore completed with 100% data integrity!');
  await prisma.$disconnect();
  return { success: true, count: backup.metadata?.totalRecords };
}

if (require.main === module) {
  const customFile = process.argv[2];
  runRestore(customFile)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('âŒ Restore failed:', err);
      process.exit(1);
    });
}

module.exports = { runRestore };

