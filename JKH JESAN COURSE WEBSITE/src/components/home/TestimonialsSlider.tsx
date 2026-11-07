"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Star, 
  CheckCircle2, Music2, Headphones, Mic2, Disc3 
} from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  daw: string;
  text: string;
  initials: string;
  bgGradient: string;
  rating: number;
  date: string;
  batch: string;
  avatar?: string;
}

const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "t1",
    name: "রাফি আহমেদ",
    role: "ইন্ডিপেন্ডেন্ট সিঙ্গার ও কম্পোজার",
    location: "মিরপুর, ঢাকা",
    daw: "FL Studio 21",
    batch: "ব্যাচ ৩",
    date: "২ দিন আগে",
    rating: 5,
    initials: "রা",
    bgGradient: "from-amber-600 to-yellow-600",
    avatar: "https://images.unsplash.com/photo-1545696968-1a5245650b36?auto=format&fit=crop&w=200&h=200&q=80",
    text: "আমার হোম স্টুডিওতে রেকর্ডেড ভোকাল আগে খুব ফাঁপা ও মাডি (muddy) শোনাত। জেসান ভাইয়ার ভোকাল প্রসেসিং ও EQ কার্ভ টেকনিক ফলো করে এখন ড্রামসের সাথে ভোকাল একদম ক্রিস্টাল ক্লিয়ার বসে যায়। আমার নতুন ট্র্যাক অলরেডি স্পটিফাইয়ে রিলিজ করেছি!",
  },
  {
    id: "t2",
    name: "সুমাইয়া বেগম",
    role: "মিউজিক প্রডিউসার ও বিটমেকার",
    location: "উপশহর, সিলেট",
    daw: "Ableton Live 11",
    batch: "ব্যাচ ২",
    date: "৪ দিন আগে",
    rating: 5,
    initials: "সু",
    bgGradient: "from-emerald-600 to-teal-700",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    text: "Ableton Live-এর ওয়ার্কফ্লো নিয়ে আমার অনেক দ্বিধা ছিল। এই কোর্সে এত গোছানোভাবে প্রতিটি টুলের ব্যবহার দেখানো হয়েছে যে ড্রাম বাস গ্লু (bus glue) এবং সাইডচেইন কম্প্রেশন এখন একদম পানির মতো সহজ লাগে।",
  },
  {
    id: "t3",
    name: "তানভীর হাসান",
    role: "সাউন্ড ডিজাইনার ও মিক্সিং ইঞ্জিনিয়ার",
    location: "জিইসি, চট্টগ্রাম",
    daw: "Logic Pro X",
    batch: "ব্যাচ ৩",
    date: "১ সপ্তাহ আগে",
    rating: 5,
    initials: "তা",
    bgGradient: "from-blue-600 to-indigo-700",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80",
    text: "মাস্টারিং চেইনের যে ট্রু-পিক লিমিটার এবং রেফারেন্স ট্র্যাকিং টেকনিকগুলো ভাই শেয়ার করেছেন, সেগুলো সত্যিই আন্তর্জাতিক মানের। স্পটিফাই ও ইউটিউবে -14 LUFS বজায় রেখে কীভাবে লাউডনেস ধরে রাখতে হয় এখন আর কোনো কনফিউশন নেই।",
  },
  {
    id: "t4",
    name: "শাকিল মাহমুদ",
    role: "হিপ-হপ ও ট্র্যাপ প্রডিউসার",
    location: "বোয়ালিয়া, রাজশাহী",
    daw: "FL Studio 21",
    batch: "ব্যাচ ১",
    date: "১ সপ্তাহ আগে",
    rating: 5,
    initials: "শা",
    bgGradient: "from-purple-600 to-pink-700",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    text: "808 সাব-বেস আর কিক ড্রামের ফ্রিকোয়েন্সি কনফ্লিক্ট নিয়ে বছরের পর বছর ভোগান্তিতে ছিলাম। সাইডচেইন এবং ডাইনামিক EQ-র সিক্রেটগুলো দেখে চোখের পলকে মিক্স ক্লিন হয়ে গেল। বাংলা ভাষায় এমন প্রফেশনাল গাইডলাইন সত্যিই দুর্লভ।",
  },
  {
    id: "t5",
    name: "ফারহানা ইয়াসমিন",
    role: "ভোকালিস্ট ও কভার আর্টিস্ট",
    location: "উত্তরা, ঢাকা",
    daw: "Cubase Pro",
    batch: "ব্যাচ ৪",
    date: "২ সপ্তাহ আগে",
    rating: 5,
    initials: "ফা",
    bgGradient: "from-rose-600 to-orange-600",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
    text: "মেলোডাইন আর অটোটিউন দিয়ে কীভাবে ভোকাল ওভার-টিউন না করে একদম রোবটিক না বানিয়ে ন্যাচারাল রাখা যায়, এটা নিয়ে আমি সবচেয়ে বেশি উপকৃত হয়েছি। ইউটিউবে কভার গানের কমেন্টে সবাই এখন আমার অডিও কোয়ালিটির প্রশংসা করে।",
  },
  {
    id: "t6",
    name: "মাহমুদুল হাসান শুভ",
    role: "জিঙ্গেল ও কমার্শিয়াল কম্পোজার",
    location: "সোনাডাঙ্গা, খুলনা",
    daw: "Studio One 6",
    batch: "ব্যাচ ২",
    date: "২ সপ্তাহ আগে",
    rating: 5,
    initials: "মা",
    bgGradient: "from-cyan-600 to-blue-700",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&h=200&q=80",
    text: "আমি বিভিন্ন এজেন্সির টিভি ও সোশ্যাল মিডিয়া অ্যাডের ব্যাকগ্রাউন্ড মিউজিক বানাই। কম সময়ে কীভাবে রেডিও ও স্মার্টফোন উভয় স্পিক্যারে ব্যালেন্সড সাউন্ড পাওয়া যায়, সেই মিড-সাইড সিক্রেটগুলো এই কোর্সে খুব নিখুঁতভাবে তুলে ধরা হয়েছে।",
  },
  {
    id: "t7",
    name: "রিফাত চৌধুরী",
    role: "ইলেকট্রনিক মিউজিক প্রডিউসার",
    location: "ময়মনসিংহ সদর",
    daw: "Ableton Live 11",
    batch: "ব্যাচ ৩",
    date: "৩ সপ্তাহ আগে",
    rating: 5,
    initials: "রি",
    bgGradient: "from-teal-600 to-emerald-700",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80",
    text: "রিভার্ব আর ডিলের প্রোপার বাস রাউটিং না জানার কারণে আগে পুরো গান ঘোলাটে শোনাত। স্টেরিও ওয়াইডেনিং আর ডিলে থ্রো টেকনিকটা দেখার পর ট্র্যাকগুলো অনেক বেশি থ্রি-ডি ও সিনেমাটিক মনে হচ্ছে।",
  },
  {
    id: "t8",
    name: "সানজিদা আক্তার",
    role: "ভয়েসওভার আর্টিস্ট ও পডকাস্টার",
    location: "ধানমন্ডি, ঢাকা",
    daw: "Adobe Audition",
    batch: "ব্যাচ ৪",
    date: "৩ সপ্তাহ আগে",
    rating: 5,
    initials: "সা",
    bgGradient: "from-violet-600 to-purple-800",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80",
    text: "পডকাস্ট রেকর্ডিংয়ের ব্যাকগ্রাউন্ড নয়েজ রিমুভাল এবং ডি-এসার (De-esser) ব্যবহারের সঠিক রুলস শিখেছি। সবচেয়ে বড় কথা, কোর্স সাপোর্ট গ্রুপে ভাইয়া নিজে অডিও শুনে ফিডব্যাক দেন, এটা অন্য কোথাও পাওয়া যায় না।",
  },
  {
    id: "t9",
    name: "আবরার ফাহিম",
    role: "ব্যান্ড বেসিস্ট ও হোম রেকর্ডার",
    location: "বরিশাল সদর",
    daw: "Reaper",
    batch: "ব্যাচ ১",
    date: "১ মাস আগে",
    rating: 5,
    initials: "আ",
    bgGradient: "from-zinc-700 to-stone-900",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80",
    text: "ব্যান্ডের লাইভ ড্রামস ও বেস ট্র্যাক মিক্স করা অনেক কঠিন মনে হতো। প্যারালাল কম্প্রেশন আর স্যাচুরেশন টেকনিক ব্যবহার করে ড্রামসের স্ন্যাপ আর বেসের বডি বহুগুণ বেড়ে গেছে। আমাদের ব্যান্ডের নতুন ইপিতে দারুণ রেজাল্ট পেয়েছি!",
  },
  {
    id: "t10",
    name: "নাবিল আহমেদ",
    role: "অ্যাকোস্টিক আর্টিস্ট ও গিটারিস্ট",
    location: "কান্দিরপাড়, কুমিল্লা",
    daw: "FL Studio 21",
    batch: "ব্যাচ ৩",
    date: "১ মাস আগে",
    rating: 5,
    initials: "না",
    bgGradient: "from-amber-700 to-stone-800",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
    text: "অ্যাকোস্টিক গিটার ও লিড ভোকালের ব্যালেন্সিংয়ে ফেজ প্রবলেম কীভাবে এড়াতে হয়, এই কোর্সে তা হাতে-কলমে শিখেছি। যারা সত্যিকারের প্রফেশনাল সাউন্ড চান, তাদের জন্য এই কোর্স ১০০% সফল একটি ইনভেস্টমেন্ট।",
  },
];

export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = TESTIMONIALS_DATA.length;
  
  // Responsive card viewport count: 2 cards at a time on mobile (per user instruction)
  const [visibleCount, setVisibleCount] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pass one by one: auto-advance by 1 every 3.5 seconds
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Triple duplicated array for smooth continuous ribbon wrap-around
  const duplicatedList = useMemo(() => {
    return [...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA];
  }, []);
  const offset = total + currentIndex;

  return (
    <div className="w-full relative select-none">
      
      {/* ── Top Bar Controls: Prev/Next buttons & slide counter ── */}
      <div className="flex items-center justify-end mb-3 sm:mb-6 px-1 sm:px-2">
        {/* Direction Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Testimonial"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-surface border border-border hover:border-primary/50 text-foreground flex items-center justify-center hover:bg-surface-raised shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-xs font-bold text-foreground/60 min-w-14 text-center">
            {currentIndex + 1} / {total}
          </span>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Testimonial"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary text-black font-black flex items-center justify-center hover:brightness-110 shadow-sm shadow-primary/20 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Carousel Slider Container (Pass One by One) ── */}
      <div 
        className="overflow-hidden w-full py-2 -my-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: `translateX(calc(-${offset * (100 / visibleCount)}%))`
          }}
        >
          {duplicatedList.map((t, idx) => {
            const isCenterInView = idx === offset;

            return (
              <div 
                key={`${t.id}-${idx}`}
                className="px-1.5 sm:px-3 shrink-0"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div className={`
                  h-full flex flex-col justify-between p-2.5 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl 
                  bg-surface border border-border transition-all duration-300
                  hover:shadow-[0_12px_32px_rgba(200,144,10,0.18)] hover:border-primary/50
                  ${isCenterInView ? 'ring-1 ring-primary/30' : ''}
                `}>
                  
                  {/* Top: Quote Badge & Star Rating */}
                  <div>
                    <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-4">
                      {/* Quote mark inside circular badge (Exact from user image) */}
                      <div className="w-5 h-5 sm:w-9 sm:h-9 rounded-full bg-[#f6edd9] dark:bg-amber-950/40 border border-amber-300/40 dark:border-amber-700/40 flex items-center justify-center text-amber-700 dark:text-amber-400 font-serif font-black text-[10px] sm:text-lg select-none">
                        ❝
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                        <span className="text-[9px] sm:text-[10px] font-bold text-foreground/60 bg-background/70 px-1.5 py-0.5 rounded border border-border">
                          {t.batch}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          {t.daw}
                        </span>
                      </div>
                    </div>

                    {/* 5 Stars */}
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-4">
                      {[...Array(t.rating)].map((_, si) => (
                        <Star 
                          key={si} 
                          size={10}
                          className="text-[#C8900A] fill-[#C8900A] sm:w-3.5 sm:h-3.5"
                        />
                      ))}
                      <span className="text-[10px] sm:text-[11px] font-bold text-foreground/50 ml-1">{t.date}</span>
                    </div>

                    {/* Realistic Review Quote */}
                    <p className="text-[11px] sm:text-sm leading-relaxed text-foreground/85 font-medium mb-2 sm:mb-4 line-clamp-3 sm:line-clamp-4 testimonial-quote">
                      “{t.text}”
                    </p>
                  </div>

                  {/* Bottom: Divider & Authentic Student Profile (No AI Look) */}
                  <div className="pt-2 sm:pt-4 border-t border-border flex items-center justify-between gap-1.5 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      
                      {/* Authentic Bengali Monogram Badge with Gradient Border */}
                      <div className="relative shrink-0">
                        <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${t.bgGradient} flex items-center justify-center text-white font-extrabold text-xs sm:text-base shadow-sm border border-white/20 select-none`}>
                          {t.initials}
                        </div>
                        {/* Verified student check badge */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 size={9} className="stroke-[3] sm:w-2.5 sm:h-2.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <p className="font-extrabold text-[11px] sm:text-sm text-foreground truncate">
                            {t.name}
                          </p>
                          <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                            ভেরিফাইড
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-foreground/60 truncate">
                          {t.role}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-foreground/45 truncate">
                          📍 {t.location}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dot Indicators at Bottom ── */}
      <div className="hidden sm:flex items-center justify-center gap-1.5 mt-6 sm:mt-8">
        {TESTIMONIALS_DATA.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            onClick={() => setCurrentIndex(dotIdx)}
            aria-label={`Go to slide ${dotIdx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === dotIdx 
                ? 'w-7 bg-primary' 
                : 'w-2 bg-border hover:bg-foreground/40'
            }`}
          />
        ))}
      </div>

    </div>
  );
}
