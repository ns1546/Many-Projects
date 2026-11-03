"use client";

import Link from "next/link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PlayCircle, CheckCircle2, Menu, X, ArrowLeft, ChevronLeft, ChevronRight, FileText, Play } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";

export default function LearnClient({
  course,
  currentLesson,
  nextLesson,
  prevLesson,
  completedLessonIds,
  progressPercentage,
  totalLessons,
  userEmail
}: {
  course: any,
  currentLesson: any,
  nextLesson: any,
  prevLesson: any,
  completedLessonIds: string[],
  progressPercentage: number,
  totalLessons: number,
  userEmail: string
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const initialModuleIndex = course.modules.findIndex((m: any) => 
    m.lessons.some((l: any) => l.id === currentLesson.id)
  );
  
  const [openModule, setOpenModule] = useState<string | undefined>(initialModuleIndex !== -1 ? `item-${initialModuleIndex}` : "item-0");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isCompleted, setIsCompleted] = useState(completedLessonIds.includes(currentLesson.id));
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const markComplete = async () => {
    if (isCompleted) return;
    setIsMarking(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLesson.id })
      });
      if (res.ok) {
        setIsCompleted(true);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20 font-sans">
      
      {/* Top Navbar */}
      <header className="h-16 bg-surface/5 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center text-foreground/80 hover:text-foreground transition-colors text-sm font-bold group">
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center mr-3 group-hover:bg-surface/10 transition-colors border border-border">
              <ArrowLeft size={16} />
            </div>
            <span className="hidden sm:inline">ড্যাশবোর্ডে ফিরে যান</span>
          </Link>
          <div className="h-6 w-px bg-surface/10 hidden sm:block"></div>
          <h1 className="font-extrabold text-sm md:text-base text-foreground tracking-tight hidden md:block truncate max-w-md">
            {course.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">

          <button 
            onClick={markComplete}
            disabled={isCompleted || isMarking}
            className={`flex items-center text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all border shadow-sm
              ${isCompleted 
                ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(200,144,10,0.25)]' 
                : 'bg-surface/5 text-foreground/80 border-border hover:bg-surface/10 hover:text-foreground'
              }`}
          >
            <CheckCircle2 size={15} className={`mr-1.5 sm:mr-2 ${isCompleted ? 'text-primary' : 'text-foreground/80'}`} /> 
            <span>{isMarking ? "..." : isCompleted ? "সম্পন্ন" : "সম্পন্ন করুন"}</span>
          </button>
          <button 
            className="md:hidden p-2 text-foreground/80 hover:text-foreground bg-surface/5 border border-border rounded-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Main Content Area (Theater Mode) */}
        <main className="flex-1 overflow-y-auto bg-background custom-scrollbar relative">
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-2 md:py-6 relative z-10 flex flex-col">
            {/* Video Player Container */}
            <div className="w-full aspect-video bg-black rounded-xl md:rounded-2xl overflow-hidden border border-border shadow-2xl relative select-none shrink-0">
              {currentLesson.videoUrl && currentLesson.videoUrl.trim() !== "#" && currentLesson.videoUrl.trim() !== "" ? (
                <SecureVideoPlayer 
                  url={currentLesson.videoUrl}
                  lessonId={currentLesson.id}
                  title={currentLesson.title}
                  poster={course.thumbnail} 
                  email={userEmail} 
                  onEnded={markComplete} 
                />
              ) : (
                <div className="w-full h-full text-foreground/80 flex flex-col items-center justify-center py-16 bg-[#0E1208]/80 rounded-xl md:rounded-2xl border border-[#2A3319]">
                  <div className="w-16 h-16 rounded-full bg-[#1A220F] border border-[#C8900A]/40 flex items-center justify-center mb-4 text-[#C8900A] shadow-[0_0_25px_rgba(200,144,10,0.2)]">
                    <Play size={28} className="ml-1 fill-[#C8900A]/20 text-[#C8900A]" />
                  </div>
                  <p className="font-extrabold tracking-wide text-foreground text-sm sm:text-base">ভিডিও লিংক শীঘ্রই যুক্ত করা হবে</p>
                  <p className="text-xs text-foreground/60 mt-1 max-w-sm text-center px-4">এই লেসনের রেকর্ডেড ক্লাস ভিডিও খুব শীঘ্রই আপলোড করা হবে।</p>
                </div>
              )}
            </div>
            
            <div className="p-6 md:p-8 lg:p-10 w-full pb-24">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
                    বর্তমান ক্লাস
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{currentLesson.title}</h2>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
                  {prevLesson && (
                    <Link href={`/learn/${course.id}/${prevLesson.id}`} className="flex items-center justify-center w-12 h-12 bg-surface/5 border border-border rounded-xl hover:bg-surface/10 transition-all shadow-sm group">
                      <ChevronLeft size={20} className="text-foreground/80 group-hover:text-foreground transition-colors" />
                    </Link>
                  )}
                  {nextLesson ? (
                    <Link href={`/learn/${course.id}/${nextLesson.id}`} className="flex items-center h-12 bg-primary hover:bg-primary-dark text-primary-foreground font-bold px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(200,144,10,0.35)] hover:shadow-[0_0_20px_rgba(200,144,10,0.5)]">
                      পরবর্তী ক্লাস
                      <ChevronRight size={18} className="ml-2" />
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="flex items-center h-12 bg-primary hover:bg-primary-dark text-primary-foreground font-bold px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(200,144,10,0.35)] hover:shadow-[0_0_20px_rgba(200,144,10,0.5)]">
                      কোর্স শেষ করুন
                      <CheckCircle2 size={18} className="ml-2" />
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none text-foreground/80 font-medium leading-relaxed bg-surface/5 p-8 rounded-2xl border border-border backdrop-blur-md shadow-xl">
                <p className="text-base md:text-lg">
                  {currentLesson.description || "এই লেসনের বিস্তারিত বিবরণ এখনো যুক্ত করা হয়নি।"}
                </p>
                
                {currentLesson.resources && (
                  <>
                    <h3 className="text-lg font-bold mt-10 mb-5 text-foreground flex items-center">
                      <FileText size={20} className="mr-2 text-primary" />
                      ডাউনলোডযোগ্য রিসোর্স
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <a href={currentLesson.resources} target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-3 bg-surface/5 border border-border rounded-xl hover:bg-surface/10 transition-all text-sm font-bold text-foreground shadow-sm hover:shadow-md group">
                        রিসোর্স ফাইল ডাউনলোড করুন
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Curriculum Sidebar */}
        <aside className={`
          fixed md:static top-0 right-0 h-full w-full max-w-[85vw] sm:w-80 lg:w-96 bg-surface border-l border-border
          transform transition-transform duration-300 z-30 overflow-y-auto flex flex-col custom-scrollbar shadow-2xl md:shadow-none
          ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}>
          <div className="p-6 border-b border-border bg-surface/90 sticky top-0 z-10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-foreground">কোর্স কারিকুলাম</h3>
              <button className="md:hidden text-foreground/80 hover:text-foreground" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-surface/5 p-4 rounded-xl border border-border">
              <div className="text-xs font-bold text-foreground/80 flex items-center justify-between mb-3">
                <span>{progressPercentage}% সম্পন্ন</span>
                <span>{completedLessonIds.length} / {totalLessons}</span>
              </div>
              <div className="w-full bg-surface/10 rounded-full h-2 overflow-hidden">
                <div className="bg-linear-h-2 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progressPercentage}%` }}>
                  <div className="absolute inset-0 bg-surface/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <Accordion type="single" collapsible value={openModule} onValueChange={setOpenModule} className="w-full grow pb-6">
            {course.modules.map((module: any, i: number) => (
              <AccordionItem key={module.id} value={`item-${i}`} className="border-0 border-b border-border rounded-none bg-transparent">
                <AccordionTrigger 
                  className="font-bold text-sm hover:bg-surface/5 px-6 py-5 data-[state=open]:bg-surface/5 transition-colors"
                >
                  <div className="flex flex-col items-start gap-1.5 text-left">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">মডিউল {i + 1}</span>
                    <span className="text-left leading-snug text-[15px] font-extrabold text-foreground">{module.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-background/30 px-0 py-0 border-0">
                  <div className="flex flex-col">
                    {module.lessons.map((lesson: any) => {
                      const isCurrent = currentLesson.id === lesson.id;
                      const isDone = completedLessonIds.includes(lesson.id);
                      
                      return (
                        <Link 
                          href={`/learn/${course.id}/${lesson.id}`}
                          key={lesson.id} 
                          className={`
                            flex items-center gap-4 p-4 pl-6 border-l-2 cursor-pointer hover:bg-surface/5 transition-colors relative
                            ${isCurrent ? 'border-primary bg-primary/5' : 'border-transparent'}
                          `}
                        >
                          {isDone ? (
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                              <CheckCircle2 size={14} className="text-primary" />
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isCurrent ? 'border-primary/50 bg-primary/10' : 'border-border bg-surface/5'}`}>
                              <Play size={10} className={isCurrent ? 'text-primary ml-0.5' : 'text-foreground/80 ml-0.5'} fill="currentColor" />
                            </div>
                          )}
                          
                          <div className="flex flex-col pr-2">
                            <span className={`text-sm line-clamp-2 leading-snug ${isCurrent ? 'font-extrabold text-foreground' : 'text-foreground/80 font-bold'}`}>
                              {lesson.title}
                            </span>
                            {lesson.duration && (
                              <span className="text-[11px] text-foreground/80 mt-1.5 font-mono bg-surface/10 w-fit px-2 py-0.5 rounded-md font-bold">{lesson.duration}</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 bg-background/20 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
