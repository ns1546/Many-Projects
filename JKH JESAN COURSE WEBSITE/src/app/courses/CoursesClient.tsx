"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Play, Clock, Shield, Headphones, ChevronRight, Search, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CoursesClientProps {
  initialCourses: any[];
}

export default function CoursesClient({ initialCourses }: CoursesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("সব কোর্স");

  const categories = ["সব কোর্স", "ভোকাল প্রসেসিং", "মিউজিক প্রোডাকশন", "মিক্সিং", "মাস্টারিং", "সাউন্ড ডিজাইন"];

  // Note: in a real app, courses would have a 'category' field. 
  // Since we might not have it in the DB yet, we can loosely mock category filtering by matching keywords,
  // or simply return all if category isn't properly structured yet.
  const filteredCourses = initialCourses.filter((course) => {
    // 1. Search filter
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Category filter (naive approach if no category field exists)
    // Adjust this logic if you add a proper category field to the Course model.
    let matchesCategory = true;
    if (activeCategory !== "সব কোর্স") {
      const catLower = activeCategory.toLowerCase();
      if (catLower.includes("ভোকাল") || catLower.includes("vocal")) {
        matchesCategory = 
          course.title.toLowerCase().includes("vocal") || 
          course.title.toLowerCase().includes("ভোকাল") ||
          (course.slug && course.slug.toLowerCase().includes("vocal")) ||
          (course.description && (course.description.toLowerCase().includes("vocal") || course.description.toLowerCase().includes("ভোকাল")));
      } else {
        matchesCategory = 
          course.title.toLowerCase().includes(catLower) || 
          (course.description && course.description.toLowerCase().includes(catLower));
      }
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="bg-surface border-b border-border pt-28 pb-14 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-125 h-125 opacity-10 bg-primary blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-8 bg-surface blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                কোর্স ক্যাটালগ
              </div>
              <h1 className="text-foreground tracking-tight mb-3" style={{ letterSpacing: "-0.03em" }}>
                সব <span className="text-primary">কোর্সসমূহ</span>
              </h1>
              <p className="text-foreground/80 font-medium leading-relaxed text-base">
                আপনার পছন্দের স্কিলটি বেছে নিন এবং প্রফেশনাল মিউজিশিয়ান হিসেবে গড়ে উঠুন।
              </p>
            </div>

            {/* Search box — SN 2: bold black border & bold black text */}
            <div className="relative w-full md:w-80 shrink-0 rounded-xl overflow-hidden group border-2 border-black focus-within:border-black transition-colors bg-white shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-black group-focus-within:text-black transition-colors">
                <Search size={18} className="stroke-[2.5] text-black" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কোর্স খুঁজুন..."
                className="w-full h-12 pl-12 pr-4 bg-white text-sm font-bold text-black placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth gap-2 pb-3 mb-6 sm:flex-wrap sm:gap-2.5 sm:mb-10 sm:pb-6 border-b border-border">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 -translate-y-0.5"
                    : "bg-surface/5 text-foreground/80 hover:bg-surface/10 hover:text-foreground border border-border"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-bold text-foreground/80">
            {filteredCourses.length}টি কোর্স পাওয়া গেছে
          </p>
        </div>

        {/* Grid */}
        {filteredCourses.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            <AnimatePresence>
              {filteredCourses.map((course: any) => {
                const totalLessons = course.modules?.reduce(
                  (a: number, m: any) => a + (m.lessons?.length || 0), 0
                ) || 0;
                
                return (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      onClick={() => router.push(`/courses/${course.slug}#purchase`)}
                      className="group bg-surface/10 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(200,144,10,0.25)] hover:border-primary/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer"
                    >
                      {/* Thumbnail — SN 8: photo size proper aspect ratio without cropping */}
                      <Link
                        href={`/courses/${course.slug}#purchase`}
                        className="aspect-[16/9] max-h-36 xs:max-h-40 sm:max-h-none relative overflow-hidden bg-zinc-950 shrink-0 block"
                        title="কোর্স প্রিভিউ ও পারচেজ করুন"
                      >
                        {/* Ambient backdrop */}
                        <div
                          className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-110"
                          style={{
                            backgroundImage: `url(${
                              course.thumbnail ||
                              "/images/vocal-processing-course.jpg"
                            })`
                          }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={course.thumbnail || "/images/vocal-processing-course.jpg"}
                          alt={course.title}
                          className="w-full h-full object-cover sm:object-contain relative z-1 transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Play button on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                            <Play size={22} className="text-primary-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                          <span className="bg-surface border border-border text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                            মিউজিক
                          </span>
                        </div>
                        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 flex items-center gap-1 bg-surface/90 backdrop-blur-md border border-border text-foreground text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md shadow-xs">
                          <Star size={11} fill="#f59e0b" className="text-amber-400" /> {course.rating || "4.9"}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-2.5 sm:p-5 flex flex-col grow">
                        <Link href={`/courses/${course.slug}`}>
                          <h2 className="font-bold text-foreground text-xs sm:text-base leading-tight mb-1 hover:text-primary transition-colors line-clamp-2">
                            {course.title}
                          </h2>
                        </Link>
                        <p className="hidden sm:block text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2 mb-2 sm:mb-4 font-medium">
                          {course.description || "প্রফেশনাল মিউজিক প্রোডাকশনের সম্পূর্ণ গাইড।"}
                        </p>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-foreground/80 font-bold mb-1.5 pb-1.5 sm:mb-4 sm:pb-4 border-b border-border">
                            <span className="flex items-center gap-1.5">
                              <Play size={11} className="text-primary" /> {totalLessons} লেসন
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={13} className="text-primary" /> লাইফটাইম
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Headphones size={13} className="text-primary" /> প্রজেক্ট ফাইলস
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div>
                              <span className="hidden sm:block text-[11px] font-bold text-primary">চিফ মেন্টর: JKH Jesan</span>
                              <span className="text-xs xs:text-sm sm:text-xl font-black text-foreground tracking-tight">
                                ৳{course.price}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Link
                                href={`/courses/${course.slug}`}
                                className="hidden sm:inline-block text-[11px] sm:text-xs font-bold text-foreground/80 hover:text-foreground bg-surface/20 hover:bg-surface/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-border transition-all"
                              >
                                বিস্তারিত
                              </Link>
                              <Link
                                href={`/checkout/${course.id}`}
                                className="course-card-btn flex items-center gap-0.5 text-[10px] sm:text-xs font-black text-black bg-primary hover:brightness-110 px-2 py-1 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl shadow-md transition-all active:scale-95 shrink-0"
                              >
                                <span>কিনুন</span>
                                <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="py-24 text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-surface/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-border">
              <Search size={32} className="text-foreground/80" />
            </div>
            <h2 className="text-xl font-black text-foreground mb-2">কোনো কোর্স পাওয়া যায়নি</h2>
            <p className="text-foreground/80 text-sm leading-relaxed mb-6">
              আপনার খোঁজার সাথে মেলে এমন কোনো কোর্স আমরা পাইনি। দয়া করে অন্য কোনো শব্দ দিয়ে আবার চেষ্টা করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("সব কোর্স");
              }}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              সব কোর্স দেখুন
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
