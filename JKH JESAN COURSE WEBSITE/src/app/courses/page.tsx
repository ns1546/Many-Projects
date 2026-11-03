import { getCachedPublicCourses } from "@/lib/cache";
import CoursesClient from "./CoursesClient";

export const metadata = {
  title: "সব কোর্স | EvoRise Media",
  description: "EvoRise Media — প্রফেশনাল মিউজিক প্রোডাকশন, মিক্সিং, মাস্টারিং এবং সাউন্ড ডিজাইন কোর্সসমূহ।",
};

export const revalidate = 60;

export default async function CoursesPage() {
  const courses = await getCachedPublicCourses();
  return <CoursesClient initialCourses={courses} />;
}
