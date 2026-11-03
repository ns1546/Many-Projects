"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";

export interface Banner {
  id: string;
  title: string | null;
  imageUrl: string;
  targetUrl: string | null;
  isActive: boolean;
  order?: number;
}

interface HeroBannerSliderProps {
  banners: Banner[];
}

export default function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Filter only active banners
  const activeBanners = banners.filter((b) => b.isActive);
  const count = activeBanners.length;

  const nextSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Auto-slide effect (paused when hovering)
  useEffect(() => {
    if (count <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [count, isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // If no banners exist in database, display a high-aesthetic default master banner
  const slides: (Banner | {
    id: string;
    title: string;
    imageUrl: string;
    targetUrl: string;
    isActive: boolean;
  })[] = count > 0 ? activeBanners : [
    {
      id: "default-1",
      title: "প্রফেশনাল মিউজিক প্রোডাকশন ও ভোকাল মিক্সিং মাস্টারক্লাস",
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
      targetUrl: "/courses",
      isActive: true,
    }
  ];

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section className="relative w-full pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-8 overflow-hidden bg-background">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-80 bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container-max relative z-10 px-3 sm:px-6">
        {/* Banner Slider Frame */}
        <div
          className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-border/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] bg-surface group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ minHeight: "220px" }}
        >
          {/* Slides Carousel */}
          <div className="relative w-full aspect-[16/10] sm:aspect-2/1 md:aspect-[2.35/1] max-h-130">
            {slides.map((banner, index) => {
              const isCurrent = index === currentIndex;
              const content = (
                <div className="relative w-full h-full select-none">
                  {/* Banner Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || `ব্যানার ${index + 1}`}
                    className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                      banner.targetUrl ? "group-hover:scale-[1.02]" : ""
                    }`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />

                  {/* Gradient overlay for legibility */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10, 10, 10, 0.90) 0%, rgba(10, 10, 10, 0.40) 50%, rgba(10, 10, 10, 0.05) 100%)",
                    }}
                  />

                  {/* Banner Text / Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 md:p-12 flex flex-col justify-end pointer-events-none">
                    <div className="max-w-3xl space-y-1.5 sm:space-y-2 md:space-y-3">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/90 text-primary-foreground text-[11px] sm:text-xs md:text-sm font-bold shadow-md backdrop-blur-md w-fit">
                        <Sparkles size={11} className="sm:w-3.5 sm:h-3.5" />
                        <span>স্পেশাল অফার</span>
                      </div>

                      {/* Title */}
                      {banner.title && (
                        <h2 className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-snug sm:leading-tight tracking-tight drop-shadow-md line-clamp-2 sm:line-clamp-none">
                          {banner.title}
                        </h2>
                      )}

                      {/* CTA button if clickable */}
                      {banner.targetUrl && (
                        <div className="pt-1 sm:pt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-white/95 hover:bg-white text-zinc-900 font-bold text-xs sm:text-sm shadow-xl transition-all duration-200 group-hover:translate-x-1">
                            <span>বিস্তারিত দেখুন</span>
                            <ArrowUpRight size={13} strokeWidth={2.5} className="text-primary sm:w-4 sm:h-4" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isCurrent ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  {banner.targetUrl ? (
                    <Link
                      href={banner.targetUrl}
                      className="block w-full h-full cursor-pointer focus:outline-none"
                      title={banner.title ? `দেখুন: ${banner.title}` : "বিস্তারিত দেখুন"}
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </div>

          {/* Previous / Next Arrow Controls (Desktop only — mobile uses touch swipe) */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevSlide();
                }}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="আগের ব্যানার"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextSlide();
                }}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="পরবর্তী ব্যানার"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* Slide Indicator Dots & Counter */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className="min-w-[24px] min-h-[24px] p-1 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary rounded-full"
                  aria-label={`ব্যানার ${idx + 1}`}
                >
                  <span
                    className={`h-2 rounded-full transition-all duration-300 block ${
                      idx === currentIndex
                        ? "w-7 bg-primary"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Slide Counter Badge (Top Right) */}
          {slides.length > 1 && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-[11px] font-mono font-bold">
              <span>{String(currentIndex + 1).padStart(2, "0")}</span>
              <span className="opacity-40 mx-1">/</span>
              <span className="opacity-70">{String(slides.length).padStart(2, "0")}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
