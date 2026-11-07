import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { 
  Play, Star, CheckCircle2, ChevronRight, PlayCircle, 
  Clock, Award, Headphones, Smartphone, Infinity, AlertCircle
} from "lucide-react";
import { db } from "@/lib/prisma";
import { getCachedCourseBySlug } from "@/lib/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCachedCourseBySlug(slug);

  if (!course) {
    return {
      title: "Course Not Found | EvoRise Media",
    };
  }

  const desc = course.description
    ? course.description.slice(0, 160)
    : "পেশাদারদের মতো মিউজিক প্রোডাকশন, মিক্সিং ও মাস্টারিং শিখুন।";

  return {
    title: `${course.title} | EvoRise Media`,
    description: desc,
    openGraph: {
      title: course.title,
      description: desc,
      type: "website",
      images: course.thumbnail ? [{ url: course.thumbnail, width: 1200, height: 630, alt: course.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: desc,
      images: course.thumbnail ? [course.thumbnail] : [],
    },
  };
}

const defaultFaqs = [
  {
    id: "df1",
    question: "কোর্সটি কীভাবে সম্পন্ন করব এবং ভিডিওগুলো কি রেকর্ড করা থাকবে?",
    answer: "হ্যাঁ, সম্পূর্ণ কোর্সটি প্রি-রেকর্ডেড হাই-ডেফিনিশন ভিডিও লেকচার আকারে সাজানো। আপনি আপনার সুবিধাজনক সময়ে যে কোনো ডিভাইস (মোবাইল, ল্যাপটপ বা ডেস্কটপ) থেকে দেখতে পারবেন।"
  },
  {
    id: "df2",
    question: "কোর্সের অ্যাক্সেস কতদিন থাকবে?",
    answer: "একবার এনরোল করলে আপনি এই কোর্সের আজীবন (Lifetime Access) এবং ভবিষ্যতের সমস্ত আপডেট ফ্রিতে পাবেন।"
  },
  {
    id: "df3",
    question: "পেমেন্ট করার পর কোর্স অ্যাক্সেস পেতে কতক্ষণ সময় লাগে?",
    answer: "বিকাশ বা নগদ-এ পেমেন্ট সম্পন্ন করে TrxID সাবমিট করার সাথে সাথেই অ্যাডমিন ভেরিফাই করে অনুমোদন দেয়। সাধারণত ৫ থেকে ৩০ মিনিটের মধ্যে আপনার ড্যাশবোর্ডে কোর্সটি চালু হয়ে যায়।"
  },
  {
    id: "df4",
    question: "কোর্স চলাকালীন কোনো সমস্যায় সহায়তা পাওয়া যাবে কি?",
    answer: "অবশ্যই! কোর্সের সাথে আমাদের ডেডিকেটেড কমিউনিটি ও WhatsApp হেল্পলাইন রয়েছে, যেখানে সরাসরি ইন্সট্রাক্টরের কাছ থেকে গাইডেন্স পাবেন।"
  }
];

export default async function CourseDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Concurrently fetch session, cached course, FAQs, and testimonials
  const [session, course, dbFaqs, testimonials] = await Promise.all([
    getServerSession(authOptions).catch(() => null),
    getCachedCourseBySlug(slug),
    db.fAQ.findMany().catch(() => []),
    db.testimonial.findMany().catch(() => []),
  ]);

  if (!course) {
    notFound();
  }

  const faqs = dbFaqs.length > 0 ? dbFaqs : defaultFaqs;

  // Lightweight targeted check for user enrollment & pending verification
  let isEnrolled = false;
  let hasPendingOrder = false;
  if (session?.user?.email && course) {
    const [enrollment, pendingOrder] = await Promise.all([
      db.enrollment.findFirst({
        where: {
          courseId: course.id,
          user: { email: session.user.email },
        },
        select: { id: true },
      }).catch(() => null),
      db.order.findFirst({
        where: {
          courseId: course.id,
          user: { email: session.user.email },
          status: "PENDING",
        },
        select: { id: true },
      }).catch(() => null),
    ]);

    isEnrolled = !!enrollment;
    hasPendingOrder = !isEnrolled && !!pendingOrder;
  }

  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0);
  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
  const classroomUrl = firstLessonId ? `/learn/${course.id}/${firstLessonId}` : `/dashboard`;

  const hasDiscount = !!(course.discountPrice && course.discountPrice < course.price);
  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.discountPrice!) / course.price) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-40 md:pb-0">

      {/* Course Header/Hero — Dark Studio Style */}
      <section className="relative bg-background text-foreground pt-24 pb-20 md:pb-44">
        {/* BG glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-125 h-125 opacity-10 bg-primary blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-8 bg-surface blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-6xl">

          {/* Breadcrumbs */}
          <div className="flex items-center text-xs font-bold tracking-widest uppercase text-foreground/80 mb-8">
            <Link href="/" className="hover:text-foreground/80 transition-colors">হোম</Link>
            <ChevronRight size={14} className="mx-2" />
            <Link href="/courses" className="hover:text-foreground/80 transition-colors">সব কোর্স</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-foreground/80">কোর্স বিস্তারিত</span>
          </div>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-12 lg:gap-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary font-bold px-4 py-1.5 rounded-full text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                মিউজিক প্রোডাকশন
              </div>
              <h1 className="text-foreground" style={{ letterSpacing: "-0.03em" }}>
                {course.title}
              </h1>
              <p className="text-foreground/80 text-lg font-medium leading-relaxed max-w-3xl">
                {course.description || "প্রফেশনালদের মতো মিউজিক প্রোডাকশনের সমস্ত টেকনিক এবং সিক্রেট শিখুন এই কোর্সে।"}
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4 text-sm font-bold border-t border-border mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary">
                    J
                  </div>
                  <div>
                    <div className="text-foreground/80 text-xs">চিফ মেন্টর</div>
                    <div className="text-foreground">JKH Jesan (EvoRise Media)</div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <div className="text-foreground/80 text-xs">রেটিং</div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-foreground ml-1">৫.০</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <div className="text-foreground/80 text-xs">কন্টেন্ট</div>
                  <div className="flex items-center gap-2 text-foreground">
                    <PlayCircle size={16} className="text-primary" /> {totalLessons} টি ক্লাস
                  </div>
                </div>
              </div>

              {/* Mobile & Tablet Purchase Card */}
              <div id="purchase-mobile" className="lg:hidden mt-8 pt-4">
                <Card className="shadow-2xl border border-border bg-surface text-foreground rounded-2xl overflow-hidden">
                  <Link
                    href={!isEnrolled ? `/checkout/${course.id}` : `/dashboard`}
                    className="aspect-video relative bg-muted border-b border-border flex items-center justify-center group cursor-pointer block"
                    title={!isEnrolled ? "ক্লিক করে এখনই কোর্সটি কিনুন" : "কোর্স কন্টিনিউ করুন"}
                  >
                    {course.thumbnail ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
                    ) : (
                      <div className="absolute inset-0 bg-[url('/images/vocal-processing-course.jpg')] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    <div className="absolute inset-0 bg-background/25 group-hover:bg-background/10 transition-colors"></div>
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                      <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                    {hasDiscount && (
                      <div className="absolute top-3 right-3 z-20 pointer-events-none">
                        <span className="bg-red-600 text-white font-black text-xs py-1 px-3 rounded-full shadow-md">
                          {discountPercent}% ছাড়
                        </span>
                      </div>
                    )}
                  </Link>
                  <CardContent className="p-6">
                    {hasPendingOrder ? (
                      <>
                        <div className="flex items-center justify-center gap-2 bg-amber-500/10 text-amber-500 py-3 rounded-xl mb-4 font-bold border border-amber-500/30 text-xs">
                          <Clock size={16} className="animate-pulse shrink-0" /> পেমেন্ট ভেরিফিকেশন অপেক্ষমাণ
                        </div>
                        <Link href="/dashboard" className="block">
                          <Button size="lg" className="w-full font-black text-sm bg-amber-500 hover:bg-amber-600 text-black h-13 rounded-xl mb-3 shadow-md">
                            ড্যাশবোর্ডে স্ট্যাটাস দেখুন
                          </Button>
                        </Link>
                        <p className="text-center text-xs text-foreground/60 mb-6 font-bold">অ্যাডমিন যাচাই সম্পন্ন হলে কোর্সটি আনলক হবে</p>
                      </>
                    ) : !isEnrolled ? (
                      <>
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-foreground/60 font-bold">কোর্স ফি</span>
                            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 whitespace-nowrap">
                              লাইফটাইম অ্যাক্সেস
                            </span>
                          </div>
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-3xl font-black tracking-tight text-primary">৳{course.discountPrice}</span>
                              <span className="text-base text-foreground/50 line-through font-bold">৳{course.price}</span>
                              <span className="bg-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                                {discountPercent}% ছাড়
                              </span>
                            </div>
                          ) : (
                            <span className="text-3xl font-black tracking-tight text-accent">৳{course.price}</span>
                          )}
                        </div>
                        <div className="space-y-2 mb-3">
                          <Link href={`/checkout/${course.id}`} className="block">
                            <Button size="lg" className="w-full font-black text-base bg-primary hover:brightness-110 text-black h-13 rounded-xl shadow-lg transition-transform active:scale-95">
                              কোর্সটি কিনে ফেলুন
                            </Button>
                          </Link>
                          {firstLessonId && (
                            <Link href={`/learn/${course.id}/${firstLessonId}`} className="block">
                              <Button variant="outline" size="lg" className="w-full font-bold text-xs sm:text-sm border-2 border-primary/60 text-foreground hover:bg-primary/10 h-11 rounded-xl flex items-center justify-center gap-1.5">
                                <PlayCircle size={16} className="text-primary" />
                                <span>১ম ক্লাস ফ্রি দেখুন (Free Preview)</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                        <p className="text-center text-xs text-foreground/50 mb-6 font-bold">লাইফটাইম অ্যাক্সেস ও সাপোর্ট</p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 bg-primary/10 text-primary py-3 rounded-lg mb-4 font-bold border border-primary/20">
                          <CheckCircle2 size={18} /> আপনি কোর্সটি কিনেছেন
                        </div>
                        <Link href={classroomUrl} className="block">
                          <Button size="lg" className="w-full font-black text-base bg-primary hover:brightness-110 text-black h-13 rounded-xl mb-6 shadow-md">
                            ক্লাসরুমে প্রবেশ করুন
                          </Button>
                        </Link>
                      </>
                    )}

                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="font-bold text-xs text-foreground/70">এই কোর্সে যা যা থাকছে:</h4>
                      <ul className="space-y-2.5 text-xs font-bold text-foreground">
                        <li className="flex items-center gap-2.5"><PlayCircle size={16} className="text-primary shrink-0" /> {totalLessons} টি প্রিমিয়াম ভিডিও লেসন</li>
                        <li className="flex items-center gap-2.5"><Infinity size={16} className="text-primary shrink-0" /> লাইফটাইম অ্যাক্সেস</li>
                        <li className="flex items-center gap-2.5"><Smartphone size={16} className="text-primary shrink-0" /> মোবাইল এবং পিসি সাপোর্ট</li>
                        <li className="flex items-center gap-2.5"><Headphones size={16} className="text-primary shrink-0" /> রিয়েল স্টেম ও প্রজেক্ট ফাইলস</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Desktop Sidebar Card */}
            <div id="purchase" className="hidden lg:block relative z-20">
              <Card className="absolute top-0 right-0 w-full shadow-2xl border-border bg-surface text-foreground rounded-2xl overflow-hidden">
                <Link
                  href={!isEnrolled ? `/checkout/${course.id}` : `/dashboard`}
                  className="aspect-video relative bg-muted border-b border-border flex items-center justify-center group cursor-pointer block"
                  title={!isEnrolled ? "ক্লিক করে এখনই কোর্সটি কিনুন" : "কোর্স কন্টিনিউ করুন"}
                >
                  {course.thumbnail ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnail})`}}></div>
                  ) : (
                      <div className="absolute inset-0 bg-[url('/images/vocal-processing-course.jpg')] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  )}
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors"></div>
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                    <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                  {hasDiscount && (
                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                      <span className="bg-red-600 text-white font-black text-xs py-1 px-3.5 rounded-full shadow-md">
                        {discountPercent}% ছাড়
                      </span>
                    </div>
                  )}
                </Link>
                <CardContent className="p-8">
                  {hasPendingOrder ? (
                    <>
                      <div className="flex items-center justify-center gap-2 bg-amber-500/10 text-amber-500 py-3 rounded-xl mb-6 font-bold border border-amber-500/30 text-xs">
                        <Clock size={16} className="animate-pulse shrink-0" /> পেমেন্ট ভেরিফিকেশন অপেক্ষমাণ
                      </div>
                      <Link href="/dashboard" className="block">
                        <Button size="lg" className="w-full font-black text-base bg-amber-500 hover:bg-amber-600 text-black h-14 rounded-xl mb-4 shadow-md">
                          ড্যাশবোর্ডে স্ট্যাটাস দেখুন
                        </Button>
                      </Link>
                      <p className="text-center text-xs text-foreground/60 mb-8 font-bold">অ্যাডমিন যাচাই সম্পন্ন হলে কোর্সটি আনলক হবে</p>
                    </>
                  ) : !isEnrolled ? (
                    <>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-foreground/60 font-bold">কোর্স ফি</span>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">
                            লাইফটাইম অ্যাক্সেস
                          </span>
                        </div>
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-extrabold tracking-tight text-primary">৳{course.discountPrice}</span>
                            <span className="text-xl text-foreground/50 line-through font-bold">৳{course.price}</span>
                            <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm ml-auto whitespace-nowrap">
                              {discountPercent}% ছাড়
                            </span>
                          </div>
                        ) : (
                          <span className="text-4xl font-extrabold tracking-tight text-accent">৳{course.price}</span>
                        )}
                      </div>
                      <div className="space-y-2.5 mb-4">
                        <Link href={`/checkout/${course.id}`} className="block">
                          <Button size="lg" className="w-full font-black text-base bg-primary hover:brightness-110 text-black h-14 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
                            কোর্সটি কিনে ফেলুন
                          </Button>
                        </Link>
                        {firstLessonId && (
                          <Link href={`/learn/${course.id}/${firstLessonId}`} className="block">
                            <Button variant="outline" size="lg" className="w-full font-bold text-sm border-2 border-primary/60 text-foreground hover:bg-primary/10 h-12 rounded-xl flex items-center justify-center gap-2">
                              <PlayCircle size={18} className="text-primary" />
                              <span>১ম ক্লাস ফ্রি দেখুন (Free Preview)</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                      <p className="text-center text-xs text-foreground/50 mb-8 font-bold">লাইফটাইম অ্যাক্সেস ও সাপোর্ট</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 bg-primary/10 text-primary py-3 rounded-lg mb-6 font-bold border border-primary/20">
                        <CheckCircle2 size={18} /> আপনি কোর্সটি কিনেছেন
                      </div>
                      <Link href={classroomUrl} className="block">
                        <Button size="lg" className="w-full font-black text-base bg-primary hover:brightness-110 text-black h-14 rounded-xl mb-8 shadow-md">
                          ক্লাসরুমে প্রবেশ করুন
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-foreground/70">এই কোর্সে যা যা থাকছে:</h4>
                    <ul className="space-y-4 text-sm font-bold text-foreground">
                      <li className="flex items-center gap-3"><PlayCircle size={18} className="text-primary" /> {totalLessons} টি প্রিমিয়াম ভিডিও লেসন</li>
                      <li className="flex items-center gap-3"><Infinity size={18} className="text-primary" /> লাইফটাইম অ্যাক্সেস</li>
                      <li className="flex items-center gap-3"><Smartphone size={18} className="text-primary" /> মোবাইল এবং পিসি সাপোর্ট</li>
                      <li className="flex items-center gap-3"><Headphones size={18} className="text-primary" /> রিয়েল স্টেম ও প্রজেক্ট ফাইলস</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Sections */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl grid lg:grid-cols-[2fr_1fr] gap-12 lg:gap-20">
          
          <div className="space-y-20">
            {/* Course Curriculum */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-accent">কোর্স কারিকুলাম</h2>
                <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                  {totalModules} টি মডিউল • {totalLessons} টি ক্লাস
                </span>
              </div>
              
              {course.modules.length > 0 ? (
                <div className="border border-border bg-surface rounded-2xl overflow-hidden shadow-sm">
                  {course.modules.map((module: any, i: number) => (
                    <details key={module.id} className="group border-b border-border last:border-0" open={i === 0}>
                      <summary className="font-bold cursor-pointer list-none hover:bg-muted px-6 py-5 flex justify-between items-center transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-primary text-sm bg-primary/10 px-2 py-1 rounded-md">মডিউল {i + 1}</span>
                          <span className="text-lg text-foreground">{module.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold bg-muted text-foreground/60 px-2 py-1 rounded hidden sm:block">
                            {module.lessons.length} ক্লাস
                          </span>
                          <ChevronRight size={18} className="text-foreground/40 group-open:rotate-90 transition-transform" />
                        </div>
                      </summary>
                      <div className="bg-surface flex flex-col border-t border-border">
                        {module.lessons.map((lesson: any, j: number) => (
                          <div key={lesson.id} className="flex items-center gap-4 px-8 py-4 hover:bg-muted transition-colors border-b border-border last:border-0">
                            <PlayCircle size={18} className="text-primary/70 shrink-0" />
                            <span className="text-sm font-bold text-foreground/80">{lesson.title}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-border bg-surface rounded-2xl text-center shadow-sm">
                  <AlertCircle size={32} className="mx-auto text-foreground/30 mb-3" />
                  <p className="font-bold text-foreground/60">এই কোর্সের কারিকুলাম এখনো যোগ করা হয়নি।</p>
                </div>
              )}
            </div>

            {/* What you'll learn */}
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-6 text-accent">কোর্সটি থেকে কী কী শিখবেন?</h2>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  "নিজের বেসিক আইডিয়া থেকে সম্পূর্ণ একটি গান তৈরি করা",
                  "প্রফেশনাল সফটওয়্যার (DAW) ব্যবহারে পূর্ণ আত্মবিশ্বাস",
                  "ভোকাল রেকর্ডিং এবং প্রসেসিংয়ের খুঁটিনাটি",
                  "গানের সাউন্ড একদম ক্লিয়ার করার জন্য মিক্সিং",
                  "রেডিও বা স্পটিফাইয়ের জন্য মাস্টার করা",
                  "মিউজিক থিওরির ব্যবহারিক প্রয়োগ",
                  "সিন্থেসাইজার দিয়ে নিজের সাউন্ড ডিজাইন করা",
                  "গান কীভাবে রিলিজ করতে হয় তার গাইডলাইন"
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start py-3 border-b border-border">
                    <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-bold leading-relaxed text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Instructor Bio */}
            <div className="pt-8 border-t border-border">
              <h2 className="text-2xl font-extrabold tracking-tight mb-6 text-accent">আপনার চিফ মেন্টর</h2>
              <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 rounded-2xl shrink-0 overflow-hidden border border-border">
                  <img src="/images/mentor-jjesan-accordion.jpg" alt="JKH Jesan" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-accent">JKH Jesan</h3>
                    <p className="text-primary font-bold text-sm">চিফ মিউজিক মেন্টর · EvoRise Media</p>
                  </div>
                  <p className="text-foreground/70 font-medium text-sm leading-relaxed">
                    EvoRise Media-র চিফ মিউজিক ইন্সট্রাক্টর ও বিশিষ্ট সাউন্ড ডিজাইনার JKH Jesan। তিনি সাধারণ কোনো টিউটর নন—গত ৫+ বছর ধরে দেশ-বিদেশের বিভিন্ন কমার্শিয়াল ট্র্যাক ও আর্টিস্টদের সাথে কাজ করে আসছেন। EvoRise Media প্ল্যাটফর্মে তিনি প্রতিটি শিক্ষার্থীকে ইন্ডাস্ট্রি-স্ট্যান্ডার্ড সাউন্ড মেকিং শেখান।
                  </p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-foreground/60 font-bold">
                      <Star size={16} className="text-amber-500" fill="currentColor" /> ৫.০ রেটিং
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/60 font-bold">
                      <PlayCircle size={16} className="text-primary" /> ১০০০+ শিক্ষার্থী
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block"></div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-surface">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-center mb-16 text-accent">শিক্ষার্থীদের মতামত</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: any) => (
                <Card key={testimonial.id} className="border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6 text-amber-500">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-foreground/80 leading-relaxed font-bold mb-8">
                      &ldquo;{testimonial.review}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                        {testimonial.image && (
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">{testimonial.name}</h4>
                        <p className="text-xs font-bold text-foreground/50">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-center mb-16 text-accent">সাধারণ জিজ্ঞাসা (FAQ)</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq: any, i: number) => (
                <AccordionItem key={faq.id} value={`item-${i}`} className="border border-border bg-surface px-6 rounded-2xl shadow-sm">
                  <AccordionTrigger className="font-bold hover:no-underline py-6 text-left text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/70 font-medium leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Mobile Sticky CTA - Clean Edge-to-Edge Bottom Bar */}
      {!isEnrolled && (
        <div
          className="lg:hidden fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.12)] px-5 pt-3 z-50 flex justify-between items-center"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
        >
          <div>
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-primary">৳{course.discountPrice}</span>
                <span className="text-xs text-foreground/50 line-through">৳{course.price}</span>
                <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  {discountPercent}% ছাড়
                </span>
              </div>
            ) : (
              <span className="text-xl font-black text-primary">৳{course.price}</span>
            )}
            <span className="text-[10px] text-foreground/70 font-semibold block">লাইফটাইম অ্যাক্সেস</span>
          </div>
          {hasPendingOrder ? (
            <Link href="/dashboard">
              <Button className="font-bold px-5 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black shadow-md transition-all active:scale-95 text-xs">
                ভেরিফিকেশন অপেক্ষমাণ
              </Button>
            </Link>
          ) : (
            <Link href={`/checkout/${course.id}`}>
              <Button className="font-bold px-7 h-11 rounded-xl bg-primary hover:bg-primary-dark text-black font-black shadow-md transition-all active:scale-95">
                কিনে ফেলুন
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
