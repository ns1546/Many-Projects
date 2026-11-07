import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BookOpen, PlayCircle, Trophy, User, Settings, LayoutDashboard, ArrowRight, Clock, XCircle, RotateCcw } from "lucide-react";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/shared/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      lessonProgresses: true,
      orders: {
        where: { status: { in: ["PENDING", "FAILED"] } },
        include: { course: true },
        orderBy: { createdAt: "desc" }
      },
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

  if (!user) redirect("/login");

  const validEnrollments = user.enrollments.filter((e: any) => e.course && !e.course.isDeleted);
  const enrolledCourses = validEnrollments.map((e: any) => e.course);
  const completedLessonsCount = user.lessonProgresses.filter((p: any) => p.completed).length;

  const completedCoursesCount = validEnrollments.filter((enrollment: any) => {
    let total = 0;
    (enrollment.course?.modules || []).forEach((m: any) => { total += (m.lessons || []).length; });
    const doneIds = user.lessonProgresses.filter((p: any) => p.completed).map((p: any) => p.lessonId);
    let done = 0;
    (enrollment.course?.modules || []).forEach((m: any) => {
      (m.lessons || []).forEach((l: any) => { if (doneIds.includes(l.id)) done++; });
    });
    return total > 0 && done === total;
  }).length;

  const pendingOrders = user.orders.filter((o: any) => o.status === "PENDING");
  const failedOrders = user.orders.filter((o: any) => o.status === "FAILED");

  const navItems = [
    { icon: LayoutDashboard, label: "ড্যাশবোর্ড", href: "/dashboard", active: true },
    { icon: BookOpen, label: "আমার কোর্স", href: "/dashboard/courses" },
    { icon: Settings, label: "প্রোফাইল", href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pt-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="bg-surface/5 border border-border backdrop-blur-md rounded-2xl overflow-hidden sticky top-24 shadow-xl">
              {/* User info — dark header */}
              <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-surface/90 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-primary text-foreground flex items-center justify-center font-black text-sm shrink-0">
                  {(user.name || "U")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-foreground/80 font-medium truncate">{user.email}</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-3 space-y-0.5">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      item.active
                        ? "bg-primary/10 text-primary font-bold border border-primary/20"
                        : "text-foreground/80 hover:bg-surface/5 hover:text-foreground border border-transparent"
                    }`}>
                    <item.icon size={17} />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 pt-2 border-t border-border">
                <SignOutButton />
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="space-y-8 min-w-0">

            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                স্বাগতম, {user.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-foreground/80 text-sm font-medium mt-1">আপনার শেখার যাত্রা চালিয়ে যান।</p>
            </div>

            {/* Mobile Sub-Navigation Pill Bar (Mobile-only) */}
            <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-border">
              {navItems.map((item) => (
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

            {/* Stats cards */}
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: BookOpen, label: "এনরোল করা কোর্স", value: enrolledCourses.length, color: "blue", bg: "bg-blue-500/10", iconColor: "text-blue-400" },
                { icon: PlayCircle, label: "সম্পন্ন লেসন", value: completedLessonsCount, color: "green", bg: "bg-primary/10", iconColor: "text-primary" },
                { icon: Trophy, label: "সার্টিফিকেট", value: completedCoursesCount, color: "amber", bg: "bg-amber-500/10", iconColor: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface/5 border border-border backdrop-blur-sm rounded-xl p-5 hover:border-border transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon size={22} className={stat.iconColor} />
                    </div>
                    <span className="text-3xl font-black text-foreground">{stat.value}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground/80">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Course list */}
            <div className="space-y-8">
              
              {/* Pending Orders Tracking */}
              {/* Rejected Orders Notice */}
              {failedOrders.length > 0 && (
                <div className="space-y-4">
                  {failedOrders.map((order: any) => (
                    <div 
                      key={order.id} 
                      className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-5 space-y-3 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-red-500 font-black text-base">
                          <XCircle size={22} className="shrink-0" />
                          <span>পেমেন্ট বাতিল করা হয়েছে: {order.course.title}</span>
                        </div>
                        <Link 
                          href={`/checkout/${order.courseId}`}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                        >
                          <RotateCcw size={14} /> পুনরায় অর্ডার করুন
                        </Link>
                      </div>
                      
                      <div className="bg-surface/90 border border-red-500/20 rounded-xl p-3.5 text-xs text-foreground space-y-1">
                        <p className="font-bold text-red-500">
                          বাতিল করার কারণ: <span className="text-foreground">{order.rejectionReason || "ভুল বা অসত্য TrxID প্রদান করা হয়েছে।"}</span>
                        </p>
                        <p className="text-[11px] text-foreground/60 leading-relaxed">
                          অনুগ্রহ করে সঠিক নম্বরে টাকা পাঠিয়ে সঠিক TrxID দিয়ে পুনরায় চেষ্টা করুন অথবা আমাদের WhatsApp হেল্পলাইনে যোগাযোগ করুন।
                        </p>
                        <div className="text-[11px] text-foreground/60 flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono">
                          <span>মেথড: {order.paymentMethod}</span>
                          <span>TrxID: {order.trxId}</span>
                          <span>পরিমাণ: ৳{order.amount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Orders Tracking */}
              {pendingOrders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={20} className="text-amber-400" />
                    <h2 className="text-lg font-black text-foreground">অপেক্ষমাণ ভেরিফিকেশন</h2>
                  </div>
                  <div className="space-y-3">
                    {pendingOrders.map((order: any) => (
                      <div key={order.id} className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-foreground mb-1">{order.course.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/80 font-medium">
                            <span>পেমেন্ট: ৳{order.amount} ({order.paymentMethod})</span>
                            <span className="font-mono bg-surface/10 px-1.5 py-0.5 rounded">TrxID: {order.trxId}</span>
                            <span>তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 font-bold text-xs rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          অপেক্ষমাণ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrolled Courses */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-foreground">আপনার কোর্সসমূহ</h2>
                  <Link href="/dashboard/courses"
                    className="text-sm font-bold text-foreground/80 hover:text-primary flex items-center gap-1 transition-colors">
                    সব দেখুন <ArrowRight size={15} />
                  </Link>
                </div>

                {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.slice(0, 3).map((course: any) => {
                    let totalLessons = 0;
                    const allLessonIds: string[] = [];
                    let nextLessonId = course.modules[0]?.lessons[0]?.id;
                    let foundNext = false;
                    const doneIds = user.lessonProgresses.filter((p: any) => p.completed).map((p: any) => p.lessonId);

                    course.modules.forEach((mod: any) => {
                      totalLessons += mod.lessons.length;
                      mod.lessons.forEach((l: any) => {
                        allLessonIds.push(l.id);
                        if (!foundNext && !doneIds.includes(l.id)) {
                          nextLessonId = l.id;
                          foundNext = true;
                        }
                      });
                    });

                    const done = allLessonIds.filter(id => doneIds.includes(id)).length;
                    const progress = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;

                    const targetHref = nextLessonId ? `/learn/${course.id}/${nextLessonId}` : `/courses`;
                    return (
                      <Link
                        key={course.id}
                        href={targetHref}
                        className="block bg-surface/5 border border-border backdrop-blur-sm rounded-xl overflow-hidden hover:border-primary hover:shadow-[0_8px_30px_rgba(200,144,10,0.25)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                        title="কোর্সের ক্লাসে যান"
                      >
                        <div className="flex flex-col sm:flex-row w-full">
                          {/* Thumbnail */}
                          <div className="sm:w-48 h-32 sm:h-auto relative bg-background shrink-0 overflow-hidden">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                              style={{ backgroundImage: `url(${course.thumbnail || "/images/vocal-processing-course.jpg"})` }} />
                            <div className="absolute inset-0 opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <PlayCircle size={20} className="text-primary-foreground" />
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex flex-col justify-between grow">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">মিউজিক প্রোডাকশন</span>
                              <h3 className="font-bold text-foreground text-base leading-snug mb-3 group-hover:text-primary transition-colors">{course.title}</h3>

                              {/* Progress */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                  <span className="text-foreground/80">অগ্রগতি</span>
                                  <span className={progress === 100 ? "text-primary font-bold" : "text-foreground/80"}>{progress}%</span>
                                </div>
                                <div className="h-1.5 bg-surface/5 rounded-full overflow-hidden border border-border">
                                  <div className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(200,144,10,0.4)]"
                                    style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-foreground/80 font-medium">
                                <Clock size={13} /> {done}/{totalLessons} লেসন
                              </div>
                              {nextLessonId ? (
                                <div
                                  className="flex items-center gap-1.5 px-4 py-2 bg-surface/10 text-foreground text-xs font-bold rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-border group-hover:border-primary shadow-sm"
                                >
                                  <PlayCircle size={14} />
                                  {progress === 0 ? "শুরু করুন" : progress === 100 ? "পুনরায় দেখুন" : "চালিয়ে যান"}
                                </div>
                              ) : (
                                <span className="text-xs text-foreground/80 font-medium">ক্লাস যোগ হয়নি</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface/5 border border-border backdrop-blur-md rounded-xl p-12 text-center">
                  <div className="w-14 h-14 bg-surface/5 border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={24} className="text-foreground/80" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">এখনো কোনো কোর্সে এনরোল করেননি</h3>
                  <p className="text-sm text-foreground/80 mb-5">আমাদের কোর্স ক্যাটালগ দেখুন এবং আজই শেখা শুরু করুন।</p>
                  <Link href="/courses"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors">
                    কোর্স দেখুন <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
