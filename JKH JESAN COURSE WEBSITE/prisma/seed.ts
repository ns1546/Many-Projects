// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database with realistic courses...');

  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);

  // 1. Create a dummy author/instructor
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jkhjesan.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@jkhjesan.com',
      name: 'Admin JKH Jesan',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Create Course 1
  const course1 = await prisma.course.upsert({
    where: { slug: 'music-production-masterclass' },
    update: {},
    create: {
      title: 'মিউজিক প্রোডাকশন মাস্টারক্লাস',
      slug: 'music-production-masterclass',
      description: 'শূন্য থেকে শুরু করে প্রফেশনাল মিউজিক প্রোডাকশনের সমস্ত টেকনিক এবং সিক্রেট শিখুন এই কোর্সে।',
      price: 4999,
      thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1470&auto=format&fit=crop',
      modules: {
        create: [
          {
            title: 'মডিউল ১: বেসিক স্টুডিও সেটআপ',
            order: 1,
            lessons: {
              create: [
                { title: 'ডিএউডব্লিউ পরিচিতি (DAW Intro)', videoUrl: '#', description: 'Video Placeholder' },
                { title: 'অডিও ইন্টারফেস ও মাইক সেটআপ', videoUrl: '#', description: 'Video Placeholder' },
              ]
            }
          },
          {
            title: 'মডিউল ২: মিউজিক থিওরি ও বিট মেকিং',
            order: 2,
            lessons: {
              create: [
                { title: 'রিদম ও টেম্পো', videoUrl: '#', description: 'Video Placeholder' },
                { title: 'কর্ড প্রগ্রেশন বেসিকস', videoUrl: '#', description: 'Video Placeholder' },
                { title: 'ড্রামস ও পারকাশন', videoUrl: '#', description: 'Video Placeholder' },
              ]
            }
          }
        ]
      }
    }
  });

  // 3. Create Course 2
  const course2 = await prisma.course.upsert({
    where: { slug: 'pro-vocal-mixing' },
    update: {},
    create: {
      title: 'প্রো ভোকাল মিক্সিং',
      slug: 'pro-vocal-mixing',
      description: 'ভোকাল কীভাবে প্রফেশনালভাবে রেকর্ড, এডিট এবং মিক্স করতে হয় তার বিস্তারিত গাইডলাইন।',
      price: 2999,
      thumbnail: 'https://images.unsplash.com/photo-1516280440502-85f81014a6da?q=80&w=1470&auto=format&fit=crop',
      modules: {
        create: [
          {
            title: 'মডিউল ১: ভোকাল রেকর্ডিং',
            order: 1,
            lessons: {
              create: [
                { title: 'মাইক প্লেসমেন্ট', videoUrl: '#', description: 'Video Placeholder' },
                { title: 'অ্যাকোস্টিক ট্রিটমেন্ট', videoUrl: '#', description: 'Video Placeholder' },
              ]
            }
          }
        ]
      }
    }
  });

  // 4. Create Course 3
  const course3 = await prisma.course.upsert({
    where: { slug: 'electronic-sound-design' },
    update: {},
    create: {
      title: 'ইলেক্ট্রনিক সাউন্ড ডিজাইন',
      slug: 'electronic-sound-design',
      description: 'সিন্থেসাইজার ব্যবহার করে নিজের ইউনিক সাউন্ড তৈরি করার কৌশল।',
      price: 3499,
      thumbnail: 'https://images.unsplash.com/photo-1621217734185-18151977755b?q=80&w=1470&auto=format&fit=crop',
      modules: {
        create: [
          {
            title: 'মডিউল ১: সিন্থেসাইজার বেসিকস',
            order: 1,
            lessons: {
              create: [
                { title: 'অসিলেটর ও ওয়েভফর্ম', videoUrl: '#', description: 'Video Placeholder' },
                { title: 'ফিল্টার ও এনভেলপ', videoUrl: '#', description: 'Video Placeholder' },
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
