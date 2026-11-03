import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BookOpen, PlayCircle, Trophy, User, LayoutDashboard, Settings, ArrowRight } from "lucide-react";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/shared/SignOutButton";

export default async function DashboardCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      lessonProgresses: true,
      enrollments: {
        include: {
          course: {
            include: {
              modules: {
                where: { isDeleted: false },
                include: { lessons: { where: { isDeleted: false } } }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const enrolledCourses = user.enrollments
    .filter((e: any) => e.course && !e.course.isDeleted)
    .map((e: any) => e.course);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-[260px_1fr] gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-28 bg-surface/5 border border-border backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">

            {/* User card */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-surface/90 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-primary text-foreground flex items-center justify-center font-black text-sm shrink-0">
                {(user.name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-foreground/80 font-medium">শিক্ষার্থী</p>
              </div>
            </div>

            <nav className="p-3 space-y-0.5">
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:bg-surface/5 hover:text-foreground font-semibold text-sm transition-colors border border-transparent">
                <LayoutDashboard size={17} /> ড্যাশবোর্ড
              </Link>
              <Link href="/dashboard/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
                <BookOpen size={17} /> আমার কোর্সসমূহ
              </Link>
              <Link href="/dashboard/certificates" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:bg-surface/5 hover:text-foreground font-semibold text-sm transition-colors border border-transparent">
                <Trophy size={17} /> সার্টিফিকেট
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:bg-surface/5 hover:text-foreground font-semibold text-sm transition-colors border border-transparent">
                <Settings size={17} /> প্রোফাইল সেটিংস
              </Link>
            </nav>

            <div className="p-4 pt-2 border-t border-border">
              <SignOutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="space-y-8 min-w-0">

          {/* Page header */}
          <div>
            <h1 className="text-2xl font-black text-foreground mb-1" style={{ letterSpacing: "-0.02em" }}>
              আমার কোর্সসমূহ
            </h1>
            <p className="text-foreground/80 text-sm font-medium">
              আপনার কেনা সবগুলো কোর্স এখানে পাবেন · {enrolledCourses.length}টি কোর্স
            </p>
          </div>

          {/* Mobile Sub-Navigation Pill Bar (Mobile-only) */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-border">
            {[
              { icon: LayoutDashboard, label: "ড্যাশবোর্ড", href: "/dashboard", active: false },
              { icon: BookOpen, label: "আমার কোর্স", href: "/dashboard/courses", active: true },
              { icon: Trophy, label: "সার্টিফিকেট", href: "/dashboard/certificates", active: false },
              { icon: Settings, label: "প্রোফাইল", href: "/profile", active: false },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface/5 text-foreground/80 hover:bg-surface/10 border border-border"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.map((course: any) => {
                let totalCourseLessons = 0;
                const courseLessonIds: string[] = [];
                let nextLessonId = course.modules[0]?.lessons[0]?.id;
                let foundNext = false;

                const completedLessonIds = (user.lessonProgresses || [])
                  .filter((p: any) => p.completed)
                  .map((p: any) => p.lessonId);

                course.modules.forEach((mod: any) => {
                  totalCourseLessons += mod.lessons.length;
                  mod.lessons.forEach((l: any) => {
                    courseLessonIds.push(l.id);
                    if (!foundNext && !completedLessonIds.includes(l.id)) {
                      nextLessonId = l.id;
                      foundNext = true;
                    }
                  });
                });

                const completedInCourse = courseLessonIds.filter((id) =>
                  completedLessonIds.includes(id)
                ).length;
                const progressPercentage =
                  totalCourseLessons > 0
                    ? Math.round((completedInCourse / totalCourseLessons) * 100)
                    : 0;

                const isCompleted = progressPercentage === 100;
                const isStarted = progressPercentage > 0;

                const targetHref = nextLessonId ? `/learn/${course.id}/${nextLessonId}` : `/courses`;
                return (
                  <Link
                    key={course.id}
                    href={targetHref}
                    className="block bg-surface/5 border border-border backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(200,144,10,0.25)] hover:border-primary hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                    title="কোর্সের ক্লাসে যান"
                  >
                    <div className="flex flex-col sm:flex-row w-full">
                      {/* Thumbnail */}
                      <div className="sm:w-64 aspect-video sm:aspect-auto bg-background relative flex items-center justify-center shrink-0 overflow-hidden">
                        {course.thumbnail ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            style={{ backgroundImage: `url(${course.thumbnail})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[url('/images/vocal-processing-course.jpg')] bg-cover bg-center opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                        )}
                        <div className="absolute inset-0 opacity-80" />
                        <PlayCircle className="text-foreground relative z-10 drop-shadow-lg group-hover:text-primary transition-colors" size={44} />

                        {/* Progress badge */}
                        {isCompleted && (
                          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm">
                            সম্পন্ন ✓
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 grow flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-primary mb-1.5">মিউজিক প্রোডাকশন</p>
                          <h3 className="font-black text-foreground text-lg mb-4 leading-snug group-hover:text-primary transition-colors" style={{ letterSpacing: "-0.01em" }}>
                            {course.title}
                          </h3>

                          {/* Progress bar */}
                          <div className="mb-5">
                            <div className="flex justify-between text-xs font-bold mb-2">
                              <span className="text-foreground/80">অগ্রগতি</span>
                              <span className="text-primary font-bold">{completedInCourse}/{totalCourseLessons} ক্লাস</span>
                            </div>
                            <div className="w-full bg-surface/5 border border-border rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-1.5 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(200,144,10,0.4)]"
                                style={{
                                  width: `${progressPercentage}%`,
                                  background: isCompleted
                                    ? "#C8900A"
                                    : "linear-gradient(90deg, #E5A817, #C8900A)",
                                }}
                              />
                            </div>
                            <p className="text-xs text-foreground/80 font-medium mt-1.5">{progressPercentage}% সম্পন্ন</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-foreground/80 font-medium">
                            {totalCourseLessons} টি ক্লাস
                          </div>
                          {nextLessonId ? (
                            <div
                              className="flex items-center gap-2 px-5 py-2.5 bg-surface/10 text-foreground font-bold text-sm rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-border group-hover:border-primary shadow-sm"
                            >
                              <PlayCircle size={16} />
                              {isCompleted ? "পুনরায় দেখুন" : isStarted ? "চালিয়ে যান" : "ক্লাস শুরু করুন"}
                            </div>
                          ) : (
                            <span className="px-5 py-2.5 text-xs font-bold text-foreground/80 bg-surface/5 border border-border rounded-xl">
                              ক্লাস যোগ হয়নি
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface/5 border border-border backdrop-blur-md rounded-2xl shadow-xl">
              <div className="w-16 h-16 bg-surface/5 border border-border text-foreground/80 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <BookOpen size={30} />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">
                আপনি এখনো কোনো কোর্সে এনরোল করেননি
              </h3>
              <p className="text-foreground/80 text-sm font-medium mb-6 max-w-xs mx-auto leading-relaxed">
                আমাদের কোর্সগুলো দেখুন এবং আপনার পছন্দের কোর্সে এনরোল করুন।
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-sm"
              >
                কোর্স ক্যাটালগ দেখুন <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
