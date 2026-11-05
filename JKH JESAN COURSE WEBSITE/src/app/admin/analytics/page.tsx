import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import AnalyticsDashboardClient from "./AnalyticsDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "অ্যানালিটিক্স ও ইউজার ট্র্যাকিং | Admin Panel",
};

export const revalidate = 0; // Realtime data

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  // Define 14 days ago for timeline calculation
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  // Parallel database queries
  const [
    settings,
    totalStudents,
    completedOrders,
    pendingOrders,
    completedOrdersList,
    recentStudents,
    coursesList,
    totalCompletedLessons,
    totalEnrollments,
    recentProgressList
  ] = await Promise.all([
    db.setting.findUnique({ where: { id: "global" } }).catch(() => null),
    db.user.count({ where: { role: "STUDENT" } }).catch(() => 0),
    db.order.count({ where: { status: "COMPLETED" } }).catch(() => 0),
    db.order.count({ where: { status: "PENDING" } }).catch(() => 0),
    db.order.findMany({
      where: { status: "COMPLETED", createdAt: { gte: fourteenDaysAgo } },
      select: { amount: true, createdAt: true },
    }).catch(() => []),
    db.user.findMany({
      where: { role: "STUDENT", createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }).catch(() => []),
    db.course.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        title: true,
        price: true,
        enrollments: { select: { id: true } }
      }
    }).catch(() => []),
    db.lessonProgress.count({ where: { completed: true } }).catch(() => 0),
    db.enrollment.count().catch(() => 0),
    db.lessonProgress.findMany({
      where: { completed: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      }
    }).catch(() => [])
  ]);

  // Aggregate all-time completed revenue
  const revenueAggregation = await db.order.aggregate({
    _sum: { amount: true },
    where: { status: "COMPLETED" },
  }).catch(() => ({ _sum: { amount: 0 } }));

  const totalRevenue = revenueAggregation._sum.amount || 0;

  // Build 14-day timeline maps
  const days = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
  const revenueMap = new Map<string, number>();
  const studentsMap = new Map<string, number>();

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const label = `${d.getDate()} ${days[d.getDay()]}`;
    revenueMap.set(label, 0);
    studentsMap.set(label, 0);
  }

  completedOrdersList.forEach((order) => {
    const d = new Date(order.createdAt);
    const label = `${d.getDate()} ${days[d.getDay()]}`;
    if (revenueMap.has(label)) {
      revenueMap.set(label, (revenueMap.get(label) || 0) + order.amount);
    }
  });

  recentStudents.forEach((st) => {
    const d = new Date(st.createdAt);
    const label = `${d.getDate()} ${days[d.getDay()]}`;
    if (studentsMap.has(label)) {
      studentsMap.set(label, (studentsMap.get(label) || 0) + 1);
    }
  });

  const revenueTimeline = Array.from(revenueMap.entries()).map(([name, revenue]) => ({
    name,
    revenue
  }));

  const registrationTimeline = Array.from(studentsMap.entries()).map(([name, students]) => ({
    name,
    students
  }));

  // Build course performance ranking
  const coursePerformance = coursesList.map((course) => {
    const studentsCount = course.enrollments.length;
    const rev = studentsCount * course.price;
    return {
      name: course.title,
      students: studentsCount,
      revenue: rev
    };
  }).sort((a, b) => b.students - a.students);

  // Conversion rate calculation (enrolled students vs total registered)
  const conversionRate = totalStudents > 0 
    ? ((completedOrders / totalStudents) * 100).toFixed(1)
    : "0.0";

  // Format recent activity
  const recentActivity = recentProgressList.map((p) => {
    const timeStr = new Date(p.updatedAt).toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return {
      id: p.id,
      userName: p.user?.name || "নামহীন শিক্ষার্থী",
      userEmail: p.user?.email || "গোপন ইমেইল",
      completedAt: timeStr,
    };
  });

  return (
    <AnalyticsDashboardClient
      initialSettings={{
        googleAnalyticsId: settings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "",
        facebookPixelId: settings?.facebookPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "",
      }}
      metrics={{
        totalStudents,
        totalRevenue,
        completedOrders,
        pendingOrders,
        conversionRate,
        totalCompletedLessons,
        totalEnrollments
      }}
      charts={{
        revenueTimeline,
        registrationTimeline,
        coursePerformance
      }}
      recentActivity={recentActivity}
    />
  );
}

