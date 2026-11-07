"use client";

import Link from "next/link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { 
  PlayCircle, CheckCircle2, Menu, X, ArrowLeft, ChevronLeft, ChevronRight, 
  FileText, Play, Lock, Sparkles, ShoppingBag, ExternalLink, ShieldCheck
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import { Logo } from "@/components/shared/Logo";
import { toast } from "sonner";

interface LearnClientProps {
  course: any;
  currentLesson: any;
  nextLesson: any;
  prevLesson: any;
  completedLessonIds: string[];
  progressPercentage: number;
  totalLessons: number;
  userEmail: string;
  isEnrolled?: boolean;
  isLocked?: boolean;
  isFreeLesson?: boolean;
}

export default function LearnClient({
  course,
  currentLesson: initialLesson,
  nextLesson: initialNext,
  prevLesson: initialPrev,
  completedLessonIds,
  progressPercentage: initialProgressPercentage,
  totalLessons,
  userEmail,
  isEnrolled = true,
  isLocked: initialIsLocked = false,
  isFreeLesson: initialIsFree = false,
}: LearnClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // ── Instant Client-Side Lesson Switching (0ms latency) ──
  const [activeLesson, setActiveLesson] = useState<any>(initialLesson);

  // Flatten all lessons across modules for instant sequential calculation
  const allLessons = useMemo(() => {
    return course.modules.flatMap((m: any) => m.lessons || []);
  }, [course.modules]);

  const activeIndex = useMemo(() => {
    return allLessons.findIndex((l: any) => l.id === activeLesson.id);
  }, [allLessons, activeLesson.id]);

  const currentNextLesson = activeIndex !== -1 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;
  const currentPrevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;

  // Active module detection
  const currentModule = useMemo(() => {
    return course.modules.find((m: any) => 
      m.lessons.some((l: any) => l.id === activeLesson.id)
    ) || null;
  }, [course.modules, activeLesson.id]);

  const activeModuleIndex = useMemo(() => {
    return course.modules.findIndex((m: any) => 
      m.lessons.some((l: any) => l.id === activeLesson.id)
    );
  }, [course.modules, activeLesson.id]);

  const [openModule, setOpenModule] = useState<string | undefined>(
    activeModuleIndex !== -1 ? `item-${activeModuleIndex}` : "item-0"
  );

  // Video switching animation state
  const [isSwitchingVideo, setIsSwitchingVideo] = useState(false);

  // Lesson free & locked calculation
  const isActiveLessonFree = (activeIndex === 0) || !!activeLesson.isFree;
  const isVideoLocked = !isEnrolled && !isActiveLessonFree;

  // Track completed lessons locally for instant tick feedback
  const [completedIds, setCompletedIds] = useState<string[]>(completedLessonIds);
  const isCompleted = completedIds.includes(activeLesson.id);
  const [isMarking, setIsMarking] = useState(false);

  // Calculate dynamic progress
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedIds.length / totalLessons) * 100) 
    : initialProgressPercentage;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Instant switch handler
  const handleSelectLesson = (lesson: any, locked: boolean) => {
    if (locked) {
      toast.error("এই ক্লাসটি দেখতে অনুগ্রহ করে কোর্সে এনরোল করুন।", {
        action: {
          label: "এনরোল করুন",
          onClick: () => router.push(`/checkout/${course.id}`)
        }
      });
      return;
    }
    setIsSwitchingVideo(true);
    setActiveLesson(lesson);
    setTimeout(() => setIsSwitchingVideo(false), 350);
    const modIdx = course.modules.findIndex((m: any) => m.lessons.some((l: any) => l.id === lesson.id));
    if (modIdx !== -1) {
      setOpenModule(`item-${modIdx}`);
    }
    window.history.pushState(null, "", `/learn/${course.id}/${lesson.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markComplete = async () => {
    if (isCompleted || !isEnrolled) return;
    setIsMarking(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: activeLesson.id })
      });
      if (res.ok) {
        setCompletedIds(prev => [...prev, activeLesson.id]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      
      {/* ── Top App Bar (Matching Reference Screenshot SN 17) ── */}
      <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-border sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link href="/" aria-label="EvoRise Media Home" className="shrink-0 flex items-center">
            <Logo size="sm" />
          </Link>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <Link 
            href={`/courses/${course.slug}`}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground/70 hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="hidden md:inline">কোর্স বিস্তারিত</span>
          </Link>

          <div className="h-5 w-px bg-border hidden md:block" />

          <div className="min-w-0 hidden md:block">
            <p className="text-xs font-semibold text-foreground/60 line-clamp-1">
              কোর্স: <span className="text-foreground font-bold">{course.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Free Badge for Preview Visitors */}
          {!isEnrolled && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Sparkles size={12} className="stroke-[2.5]" />
                ফ্রি প্রিভিউ
              </span>
              <Link
                href={`/checkout/${course.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:brightness-110 text-black font-black text-xs shadow-sm transition-all"
              >
                <ShoppingBag size={13} className="stroke-[2.5]" />
                <span>এনরোল করুন</span>
              </Link>
            </div>
          )}

          {/* Mark Complete Checkbox / Button */}
          {isEnrolled && (
            <button
              onClick={markComplete}
              disabled={isCompleted || isMarking}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-primary hover:brightness-110 text-black shadow-sm font-black'
              }`}
            >
              <CheckCircle2 size={15} />
              <span>{isCompleted ? "সম্পন্ন হয়েছে" : "সম্পন্ন চিহ্নিত করুন"}</span>
            </button>
          )}

          {/* Mobile Playlist Drawer Toggle */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-raised transition-colors flex items-center gap-1.5"
            aria-label="Toggle Playlist"
          >
            <Menu size={18} />
            <span className="text-xs font-bold sm:inline hidden">প্লেলিস্ট</span>
          </button>
        </div>
      </header>

      {/* ── Main Classroom Body (Split View) ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ════════ Left: Video Player & Lecture Theater Area ════════ */}
          <div className="col-span-12 lg:col-span-8 flex flex-col">

            {/* Lecture Title Above Player (Exact Reference from Screenshot SN 17) */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {currentModule && (
                  <span className="text-[11px] sm:text-xs font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    {currentModule.title}
                  </span>
                )}
                {isActiveLessonFree && (
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    ফ্রি ক্লাস
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
                {activeLesson.title}
              </h1>
            </div>

            {/* Video Player Box */}
            <div className="learn-video-container w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border shadow-xl relative select-none">
              {/* Switching Video Loading Animation */}
              {isSwitchingVideo && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center z-30 select-none animate-fadeIn">
                  <div className="flex items-center gap-1.5 h-7 mb-2.5">
                    <span className="w-1.5 bg-primary rounded-full animate-[soundWave_0.8s_ease-in-out_infinite] h-3" />
                    <span className="w-1.5 bg-primary rounded-full animate-[soundWave_1s_ease-in-out_infinite_0.2s] h-5" />
                    <span className="w-1.5 bg-primary rounded-full animate-[soundWave_0.7s_ease-in-out_infinite_0.4s] h-7" />
                    <span className="w-1.5 bg-primary rounded-full animate-[soundWave_1.1s_ease-in-out_infinite_0.1s] h-4" />
                    <span className="w-1.5 bg-primary rounded-full animate-[soundWave_0.9s_ease-in-out_infinite_0.3s] h-6" />
                  </div>
                  <p className="text-xs font-bold text-white tracking-wide">ভিডিও লোড হচ্ছে...</p>
                </div>
              )}
              {isVideoLocked ? (
                /* Locked State for Non-Enrolled User on Paid Lesson */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-radial from-surface to-background relative overflow-hidden">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-5 text-primary shadow-lg shadow-primary/20">
                    <Lock size={32} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-foreground mb-2">
                    এই ক্লাসটি লক করা আছে
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/70 max-w-md leading-relaxed mb-6 font-medium">
                    সম্পূর্ণ কোর্স এবং এই প্রিমিয়াম লেকচারটি দেখতে এখনই এনরোল করুন। আপনি পাবেন আজীবন অ্যাক্সেস ও ইন্সট্রাক্টর সাপোর্ট।
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/checkout/${course.id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:brightness-110 text-black font-black text-sm shadow-lg shadow-primary/30 active:scale-95 transition-all"
                    >
                      <ShoppingBag size={16} className="stroke-[2.5]" />
                      <span>
                        কোর্স কিনুন (৳{course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price})
                      </span>
                    </Link>
                    {currentPrevLesson && (
                      <button
                        type="button"
                        onClick={() => {
                          const pIdx = activeIndex - 1;
                          const isPrevFree = pIdx === 0 || !!currentPrevLesson.isFree;
                          handleSelectLesson(currentPrevLesson, !isEnrolled && !isPrevFree);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-surface border border-border hover:bg-surface-raised text-foreground font-bold text-sm transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={15} />
                        <span>আগের ক্লাসে ফিরুন</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : activeLesson.videoUrl && activeLesson.videoUrl.trim() !== "#" && activeLesson.videoUrl.trim() !== "" ? (
                /* Active Video Player */
                <SecureVideoPlayer 
                  key={activeLesson.id}
                  url={activeLesson.videoUrl}
                  lessonId={activeLesson.id}
                  title={activeLesson.title}
                  poster={course.thumbnail} 
                  email={userEmail} 
                  onEnded={markComplete} 
                />
              ) : (
                /* Placeholder when Video URL is empty */
                <div className="w-full h-full text-foreground/80 flex flex-col items-center justify-center py-16 bg-surface/50 rounded-2xl border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary shadow-md">
                    <Play size={28} className="ml-1 fill-primary/20 text-primary" />
                  </div>
                  <p className="font-extrabold tracking-wide text-foreground text-sm sm:text-base">ভিডিও লিংক শীঘ্রই যুক্ত করা হবে</p>
                  <p className="text-xs text-foreground/60 mt-1 max-w-sm text-center px-4">এই লেসনের রেকর্ডেড ক্লাস ভিডিও খুব শীঘ্রই আপলোড করা হবে।</p>
                </div>
              )}
            </div>

            {/* Bottom Controls / Navigation */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border shadow-xs">
              <div className="flex items-center gap-2">
                {currentPrevLesson && (
                  <button 
                    type="button"
                    onClick={() => {
                      const pIdx = activeIndex - 1;
                      const isPrevFree = pIdx === 0 || !!currentPrevLesson.isFree;
                      handleSelectLesson(currentPrevLesson, !isEnrolled && !isPrevFree);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-raised hover:bg-surface border border-border text-foreground font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>আগের ক্লাস</span>
                  </button>
                )}
                {currentNextLesson && (
                  <button 
                    type="button"
                    onClick={() => {
                      const nIdx = activeIndex + 1;
                      const isNextFree = nIdx === 0 || !!currentNextLesson.isFree;
                      handleSelectLesson(currentNextLesson, !isEnrolled && !isNextFree);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
                  >
                    <span>পরবর্তী ক্লাস</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {activeLesson.resources && (
                <a 
                  href={activeLesson.resources} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-bold transition-all ml-auto"
                >
                  <FileText size={15} />
                  <span>রিসোর্স ডাউনলোড</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              )}
            </div>

            {/* Lesson Details / Description */}
            <div className="mt-6 p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
              <h3 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>ক্লাসের বিস্তারিত বিবরণ</span>
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-medium whitespace-pre-line">
                {activeLesson.description || "এই লেসনে শেখানো বিষয়সমূহ মনোযোগ দিয়ে সম্পূর্ণ ভিডিওটি দেখুন এবং নির্দেশিকা অনুযায়ী প্র্যাকটিস করুন।"}
              </p>

              {!isEnrolled && (
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 p-4 rounded-xl border-dashed">
                  <div>
                    <p className="font-black text-sm text-foreground">সম্পূর্ণ কোর্সটি ভালো লেগেছে?</p>
                    <p className="text-xs text-foreground/70">একবার এনরোল করুন এবং পান আনলিমিটেড লাইফটাইম অ্যাক্সেস।</p>
                  </div>
                  <Link
                    href={`/checkout/${course.id}`}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-md transition-all shrink-0"
                  >
                    এখনই এনরোল করুন
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ════════ Right: Playlist Curriculum (Reference SN 17) ════════ */}
          <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            
            {/* Playlist Container Card */}
            <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col">
              
              {/* Header: 'আর্কাইভ প্লেলিস্ট' + Total count badge (From SN 17 image) */}
              <div className="p-4 sm:p-5 border-b border-border bg-surface-raised flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-red-500 shrink-0" />
                  <h2 className="font-black text-base text-foreground tracking-tight">
                    আর্কাইভ প্লেলিস্ট
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  মোট {totalLessons} ক্লাস
                </span>
              </div>

              {/* Course Progress Bar (for enrolled students) */}
              {isEnrolled && (
                <div className="px-5 py-3 border-b border-border/80 bg-background/50">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground/70 mb-1.5">
                    <span>কোর্স প্রগ্রেস</span>
                    <span>{progressPercentage}% ({completedIds.length}/{totalLessons})</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercentage}%` }} 
                    />
                  </div>
                </div>
              )}

              {/* Module Accordion List */}
              <Accordion 
                type="single" 
                collapsible 
                value={openModule} 
                onValueChange={setOpenModule} 
                className="w-full max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar"
              >
                {course.modules.map((module: any, i: number) => {
                  const moduleLessonCount = module.lessons?.length || 0;
                  
                  return (
                    <AccordionItem 
                      key={module.id} 
                      value={`item-${i}`} 
                      className="border-b border-border last:border-b-0"
                    >
                      <AccordionTrigger className="px-4 sm:px-5 py-3.5 hover:bg-surface-raised/70 transition-colors text-left group">
                        <div className="flex items-center justify-between w-full pr-2">
                          <div className="flex flex-col items-start gap-0.5 min-w-0 pr-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              মডিউল {i + 1}
                            </span>
                            <span className="font-black text-xs sm:text-sm text-foreground line-clamp-1 leading-snug">
                              {module.title}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-foreground/60 shrink-0 px-2 py-0.5 rounded-md bg-surface border border-border">
                            {moduleLessonCount} ক্লাস
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="p-0 border-t border-border/60 bg-background/40">
                        <div className="divide-y divide-border/40">
                          {module.lessons.map((lesson: any, lIdx: number) => {
                            const isCurrent = activeLesson.id === lesson.id;
                            const isDone = completedIds.includes(lesson.id);
                            const isLessonFree = (i === 0 && lIdx === 0) || !!lesson.isFree;
                            const isLessonLocked = !isEnrolled && !isLessonFree;

                            return (
                              <button 
                                key={lesson.id}
                                type="button"
                                onClick={() => handleSelectLesson(lesson, isLessonLocked)}
                                className={`
                                  w-full text-left flex items-center gap-3 px-4 sm:px-5 py-3 transition-all relative group cursor-pointer
                                  ${isCurrent 
                                    ? 'bg-red-500/10 border-l-4 border-red-500' 
                                    : 'hover:bg-surface-raised border-l-4 border-transparent'}
                                `}
                              >
                                {/* Left Status Icon */}
                                <div className="shrink-0">
                                  {isCurrent ? (
                                    <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                                      <Play size={13} fill="currentColor" className="ml-0.5" />
                                    </div>
                                  ) : isDone ? (
                                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                                      <CheckCircle2 size={15} />
                                    </div>
                                  ) : isLessonLocked ? (
                                    <div className="w-7 h-7 rounded-full bg-surface border border-border text-foreground/40 flex items-center justify-center">
                                      <Lock size={13} />
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                      <PlayCircle size={15} />
                                    </div>
                                  )}
                                </div>

                                {/* Lesson Title & Duration */}
                                <div className="min-w-0 flex-1">
                                  <p className={`text-xs sm:text-sm line-clamp-2 leading-snug ${
                                    isCurrent ? 'font-black text-red-600 dark:text-red-400' : 'font-bold text-foreground/90 group-hover:text-primary transition-colors'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {lesson.duration && (
                                      <span className="text-[10px] font-mono font-semibold text-foreground/60">
                                        {lesson.duration}
                                      </span>
                                    )}
                                    {isLessonFree && !isEnrolled && (
                                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/15">
                                        ফ্রি
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right Badge: 'চলছে' for active, chevron for others */}
                                <div className="shrink-0">
                                  {isCurrent ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
                                      চলছে
                                    </span>
                                  ) : (
                                    <ChevronRight size={14} className="text-foreground/40 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-all" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </aside>
        </div>
      </main>

      {/* ── Mobile Drawer Backdrop & Drawer ── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="absolute top-0 right-0 h-full w-85 max-w-[90vw] bg-surface border-l border-border flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface-raised">
              <h3 className="font-black text-sm text-foreground">আর্কাইভ প্লেলিস্ট</h3>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-foreground/60 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {course.modules.map((m: any, mIdx: number) => (
                <div key={m.id} className="border-b border-border/80">
                  <div className="px-4 py-2.5 bg-background/50 font-bold text-xs text-primary">
                    মডিউল {mIdx + 1}: {m.title}
                  </div>
                  <div className="divide-y divide-border/40">
                    {m.lessons.map((l: any, lIdx: number) => {
                      const isCurrent = l.id === activeLesson.id;
                      const isLessonFree = (mIdx === 0 && lIdx === 0) || !!l.isFree;
                      const isLocked = !isEnrolled && !isLessonFree;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            handleSelectLesson(l, isLocked);
                            setSidebarOpen(false);
                          }}
                          className={`w-full text-left flex items-center justify-between p-3.5 text-xs font-bold cursor-pointer ${
                            isCurrent ? 'bg-red-500/10 text-red-500' : 'text-foreground/80 hover:bg-surface-raised'
                          }`}
                        >
                          <span className="line-clamp-2 mr-2">{l.title}</span>
                          {isCurrent ? (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-600 text-white rounded font-bold shrink-0">
                              চলছে
                            </span>
                          ) : (
                            <ChevronRight size={14} className="text-foreground/40 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
