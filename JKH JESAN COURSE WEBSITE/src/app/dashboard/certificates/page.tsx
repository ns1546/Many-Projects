import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, User, LayoutDashboard, Settings, Download } from "lucide-react";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/shared/SignOutButton";
import PrintButton from "./PrintButton";

export default async function DashboardCertificatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              modules: {
                include: { lessons: true }
              }
            }
          }
        }
      },
      lessonProgresses: true
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate completed courses
  const completedCourses = user.enrollments.map((enrollment: any) => {
    let totalLessons = 0;
    enrollment.course.modules.forEach((mod: any) => {
      totalLessons += mod.lessons.length;
    });

    const completedLessonIds = (user.lessonProgresses || [])
      .filter((p: any) => p.completed)
      .map((p: any) => p.lessonId);

    let completedInCourse = 0;
    enrollment.course.modules.forEach((mod: any) => {
      mod.lessons.forEach((lesson: any) => {
        if (completedLessonIds.includes(lesson.id)) completedInCourse++;
      });
    });

    const isCompleted = totalLessons > 0 && completedInCourse === totalLessons;

    return {
      course: enrollment.course,
      isCompleted,
      completedAt: enrollment.updatedAt // Approximation for when they finished
    };
  }).filter((c: any) => c.isCompleted);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-[260px_1fr] gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-28 bg-surface/5 border border-border backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
            {/* Dark user header */}
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
              <Link href="/dashboard/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:bg-surface/5 hover:text-foreground font-semibold text-sm transition-colors border border-transparent">
                <BookOpen size={17} /> আমার কোর্সসমূহ
              </Link>
              <Link href="/dashboard/certificates" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
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
          <div>
            <h1 className="text-2xl font-black text-foreground mb-1" style={{ letterSpacing: "-0.02em" }}>সার্টিফিকেট</h1>
            <p className="text-foreground/80 text-sm font-medium">আপনার অর্জন করা সব সার্টিফিকেট এখানে প্রদর্শিত হবে।</p>
          </div>

          {/* Mobile Sub-Navigation Pill Bar (Mobile-only) */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-border">
            {[
              { icon: LayoutDashboard, label: "ড্যাশবোর্ড", href: "/dashboard", active: false },
              { icon: BookOpen, label: "আমার কোর্স", href: "/dashboard/courses", active: false },
              { icon: Trophy, label: "সার্টিফিকেট", href: "/dashboard/certificates", active: true },
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

          {completedCourses.length > 0 ? (
            <div className="grid gap-12">
              {completedCourses.map((c: any, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Beautiful Visual Certificate */}
                  <div className="relative w-full max-w-200 aspect-[1.414/1] bg-[#FAF8F5] text-primary p-8 md:p-14 flex flex-col items-center justify-center text-center shadow-xl rounded-sm border-8 md:border-12 border-[#1A1F0F]/10 overflow-hidden">
                    {/* Background Pattern - Pure CSS Grid */}
                    <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#1A1F0F_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    
                    {/* Corner Ornaments */}
                    <div className="absolute top-4 left-4 w-12 h-12 md:w-16 md:h-16 border-t-4 border-l-4 border-primary"></div>
                    <div className="absolute top-4 right-4 w-12 h-12 md:w-16 md:h-16 border-t-4 border-r-4 border-primary"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 md:w-16 md:h-16 border-b-4 border-l-4 border-primary"></div>
                    <div className="absolute bottom-4 right-4 w-12 h-12 md:w-16 md:h-16 border-b-4 border-r-4 border-primary"></div>

                    <div className="relative z-10 w-full">
                      <div className="text-[11px] font-black uppercase tracking-[0.35em] text-primary mb-1">EvoRise Media Academy</div>
                      <h2 className="text-foreground/80 font-black tracking-[0.25em] uppercase text-xs md:text-sm mb-6 md:mb-8">Certificate of Completion</h2>
                      
                      <div className="font-serif text-3xl md:text-5xl font-black mb-4 text-[#1A1F0F]">
                        {user.name}
                      </div>
                      
                      <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
                      
                      <p className="text-xs md:text-base text-gray-600 mb-2 font-bold">has successfully completed the professional curriculum for</p>
                      <h3 className="font-extrabold text-xl md:text-3xl text-[#1A1F0F] mb-8">&ldquo;{c.course.title}&rdquo;</h3>
                      
                      <div className="flex justify-between items-end w-full px-4 md:px-10 mb-4">
                        <div className="text-left flex flex-col items-center">
                          <div className="border-b-2 border-gray-400 w-28 md:w-44 mb-1.5 pb-1 text-center text-gray-800 font-extrabold text-xs md:text-sm">
                            {new Date(c.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">Issue Date</span>
                        </div>
                        
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-primary/30 flex items-center justify-center relative">
                          <div className="absolute inset-1 rounded-full border border-primary/50 flex items-center justify-center">
                            <Trophy className="text-primary" size={24} />
                          </div>
                          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_25s_linear_infinite] opacity-60">
                            <path id="curve" fill="transparent" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                            <text width="500">
                              <textPath href="#curve" className="text-[9px] font-bold uppercase tracking-[0.25em] fill-primary">
                                EVORISE MEDIA • VERIFIED • EVORISE MEDIA • VERIFIED • 
                              </textPath>
                            </text>
                          </svg>
                        </div>

                        <div className="text-right flex flex-col items-center">
                          <div className="border-b-2 border-gray-400 w-28 md:w-44 mb-1.5 pb-1 text-center text-gray-800 font-bold font-signature italic text-lg md:text-xl">
                            JKH Jesan
                          </div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold">Chief Mentor · EvoRise Media</span>
                        </div>
                      </div>

                      {/* Official Verification Serial */}
                      <div className="pt-2 border-t border-gray-200/80 inline-block px-4">
                        <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">
                          Credential ID: EVO-{(c.course.id || "CERT").slice(-6).toUpperCase()}-{(user.id || "GRAD").slice(-4).toUpperCase()} • evorisemedia.com/verify
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <PrintButton />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface/5 border border-border backdrop-blur-md rounded-2xl shadow-xl">
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} />
              </div>
              <h4 className="text-xl font-extrabold mb-2 text-foreground">কোনো সার্টিফিকেট নেই</h4>
              <p className="text-foreground/80 mb-6 font-bold">কোর্স সম্পূর্ণ করে আপনার প্রথম সার্টিফিকেট অর্জন করুন।</p>
              <Link href="/dashboard/courses">
                <Button className="font-bold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl px-8 shadow-md transition-all">
                  কোর্স চালিয়ে যান
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
