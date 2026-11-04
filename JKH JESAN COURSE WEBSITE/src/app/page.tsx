import Link from "next/link";
import {
  IconArrowUpRight, IconStar, IconUsers, IconBook,
  IconAward, IconShieldCheck, IconBolt, IconHeadphones,
  IconMicrophone, IconAdjustments, IconTargetArrow, IconDeviceLaptop,
  IconQuote, IconCircleCheck
} from "@tabler/icons-react";
import { prisma as db } from "@/lib/prisma";
import { getCachedHomepageData } from "@/lib/cache";
import HeroBannerSlider from "@/components/HeroBannerSlider";
import AnimatedStatsCounter from "@/components/home/AnimatedStatsCounter";
import TestimonialsSlider from "@/components/home/TestimonialsSlider";
import HomeFAQ from "@/components/home/HomeFAQ";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EvoRise Media — ক্রিয়েটিভ মিডিয়া ও মিউজিক একাডেমি',
  description: 'EvoRise Media-র চিফ মেন্টর JKH Jesan-এর সাথে শিখুন প্রফেশনাল মিউজিক প্রোডাকশন, মিক্সিং ও মাস্টারিং।',
  openGraph: {
    title: 'EvoRise Media | Creative Academy',
    description: 'EvoRise Media — ক্রিয়েটিভ মিডিয়া ও মিউজিক একাডেমি।',
    images: [{ url: '/images/mentor-jjesan-mandolin.jpg' }]
  }
};

const whyItems = [
  { Icon: IconTargetArrow, title: "বিশেষজ্ঞ ইন্সট্রাক্টর",   desc: "ইন্ডাস্ট্রি প্রফেশনালদের কাছ থেকে শিখুন।" },
  { Icon: IconDeviceLaptop, title: "যেকোনো ডিভাইসে",         desc: "মোবাইল, ট্যাবলেট বা পিসি — যেকোনো সময়।" },
  { Icon: IconHeadphones,   title: "রিয়েল প্রজেক্ট ফাইলস",     desc: "প্রফেশনাল কমার্শিয়াল ট্র্যাক ও মাল্টিট্র্যাক স্টেম।" },
  { Icon: IconUsers,        title: "কমিউনিটি সাপোর্ট",        desc: "সমমনা শিক্ষার্থীদের সাথে এগিয়ে যান।" },
  { Icon: IconBolt,         title: "লাইফটাইম অ্যাক্সেস",      desc: "একবার কিনুন, চিরকাল অ্যাক্সেস পান।" },
  { Icon: IconShieldCheck,  title: "১০০% প্র্যাকটিক্যাল শিক্ষা",   desc: "বাস্তব মিউজিক প্রজেক্ট ভিত্তিক কোর্স।" },
];

const instructorFeatures = [
  { Icon: IconHeadphones, title: "প্রফেশনাল DAW শিক্ষা",  desc: "FL Studio ও Ableton Live-এ শূন্য থেকে দক্ষতা" },
  { Icon: IconAdjustments,    title: "মিক্সিং ও মাস্টারিং",  desc: "রেডিও-রেডি সাউন্ডের প্রফেশনাল টেকনিক" },
  { Icon: IconMicrophone, title: "ভোকাল প্রোডাকশন",      desc: "রেকর্ডিং থেকে ফাইনাল প্রসেসিং পর্যন্ত" },
];

export const revalidate = 60;

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default async function Home() {
  let stats = {
    students: 150,
    courses: 3,
    lessons: 45,
    rating: 4.9
  };
  let courses: any[] = [];
  let banners: any[] = [];
  let whyChooseUsImage = "/images/why-choose-us.jpg";
  let heroMentorImage = "/images/mentor-jjesan-mandolin.jpg";
  let aboutMentorImage = "/images/mentor-jjesan-accordion.jpg";

  try {
    const homeData = await getCachedHomepageData();
    stats = homeData.stats;
    courses = homeData.courses;
    const allBanners = homeData.banners || [];
    banners = allBanners.filter((b: any) => !b.targetUrl?.startsWith("section:"));

    const whyChooseUsBanner = allBanners.find((b: any) => b.targetUrl === "section:why-choose-us" && b.isActive);
    const heroMentorBanner = allBanners.find((b: any) => b.targetUrl === "section:hero-mentor" && b.isActive);
    const aboutMentorBanner = allBanners.find((b: any) => b.targetUrl === "section:about-mentor" && b.isActive);

    if (whyChooseUsBanner?.imageUrl) whyChooseUsImage = whyChooseUsBanner.imageUrl;
    if (heroMentorBanner?.imageUrl) heroMentorImage = heroMentorBanner.imageUrl;
    if (aboutMentorBanner?.imageUrl) aboutMentorImage = aboutMentorBanner.imageUrl;
  } catch (error) {
    console.warn("Could not fetch database records for Home page (using fallback):", error);
  }

  return (
    <div className="flex flex-col">

      {/* ════════════════════════════════════════════════════
          HERO BANNER SLIDER — Interactive Widescreen Showcase
          ════════════════════════════════════════════════════ */}
      <HeroBannerSlider banners={banners} />

      {/* ════════════════════════════════════════════════════
          COURSES — Card grid
          ════════════════════════════════════════════════════ */}
      <section id="courses" className="section-lg scroll-mt-20" style={{ background: "var(--cream-200)" }}>
        <div className="container-max">

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10 lg:mb-14">
            <div>
              <h2 style={{ color: "var(--ink-900)" }}>
                জনপ্রিয় <span style={{ color: "var(--primary)" }}>কোর্সসমূহ</span>
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-base font-medium" style={{ color: "var(--foreground-muted)", maxWidth: "44ch" }}>
                প্রফেশনাল ইন্সট্রাক্টরের হাতে-কলমে শিক্ষায় সংগীতে দক্ষতা অর্জন করুন।
              </p>
            </div>
            <Link href="/courses" className="btn-outline self-start md:self-auto text-xs sm:text-sm py-2 px-3.5 sm:py-2.5 sm:px-4">
              সব কোর্স দেখুন
              <IconArrowUpRight size={15} strokeWidth={2} />
            </Link>
          </div>

          {/* Course cards grid — Pro, compact responsive sizing for all phones & tablets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.length > 0 ? courses.map((course: any) => {
              const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
              const hasDiscount = course.discountPrice && course.discountPrice < course.price;
              const discountPercent = hasDiscount
                ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
                : 0;

              return (
                <div key={course.id} className="card group flex flex-col hover:shadow-xl hover:border-primary/60 transition-all duration-300 relative">
                  <Link href={`/courses/${course.slug}#purchase`} className="absolute inset-0 z-0" aria-label={course.title} />

                  {/* Thumbnail */}
                  <Link
                    href={`/courses/${course.slug}#purchase`}
                    className="relative aspect-video overflow-hidden block bg-zinc-950"
                    style={{ borderRadius: "1rem 1rem 0 0" }}
                    title="কোর্স প্রিভিউ ও পারচেজ করুন"
                  >
                    {/* Ambient backdrop */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-110"
                      style={{
                        backgroundImage: `url(${course.thumbnail || "/images/vocal-processing-course.jpg"})`
                      }}
                    />

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.thumbnail || "/images/vocal-processing-course.jpg"}
                      alt={course.title}
                      className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 pointer-events-none" />

                    {/* Level badge */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-30 pointer-events-none">
                      <span className="badge badge-accent text-[10px] sm:text-xs py-0.5 px-2">
                        {course.level === "BEGINNER" ? "বিগিনার" : course.level === "INTERMEDIATE" ? "মিডিয়াম" : "অ্যাডভান্সড"}
                      </span>
                    </div>

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-30 pointer-events-none">
                        <span className="badge bg-red-600 text-white font-bold text-[10px] sm:text-xs py-0.5 px-2 shadow-sm">
                          {discountPercent}% ছাড়
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Body — Tight padding on mobile */}
                  <div className="p-3.5 sm:p-5 lg:p-6 flex flex-col grow">
                    {/* Meta strip */}
                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs mb-2 sm:mb-2.5" style={{ color: "var(--foreground-muted)" }}>
                      <span className="flex items-center gap-1">
                        <IconBook size={12} strokeWidth={2} /> {totalLessons} লেসন
                      </span>
                      {course.duration && (
                        <>
                          <span>•</span>
                          <span>{course.duration}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-primary truncate">
                        <IconHeadphones size={12} strokeWidth={2} /> প্রজেক্ট ফাইলস
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-1.5 group-hover:text-primary transition-colors line-clamp-2"
                      style={{ color: "var(--ink-900)" }}>
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm mb-3 sm:mb-4 grow line-clamp-2" style={{ color: "var(--foreground-muted)" }}>
                      {course.description}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 pb-2.5 mb-2.5 sm:pb-3.5 sm:mb-3.5 border-b border-border">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] sm:text-xs font-bold text-primary">
                        {(course.instructor?.name || "J")[0]}
                      </div>
                      <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                        {course.instructor?.name || "JKH Jesan"}
                      </span>
                    </div>

                    {/* Footer: Price + Button */}
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg sm:text-xl font-black text-primary">
                              ৳{course.discountPrice?.toLocaleString()}
                            </span>
                            <span className="text-[11px] sm:text-xs line-through" style={{ color: "var(--foreground-muted)" }}>
                              ৳{course.price?.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg sm:text-xl font-black text-primary">
                            ৳{course.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/courses/${course.slug}#purchase`}
                        className="btn-primary text-xs py-1.5 px-3 sm:py-2 sm:px-3.5 relative z-10"
                        title="কোর্স এনরোল ও পেমেন্ট করুন"
                      >
                        এনরোল করুন
                        <IconArrowUpRight size={13} strokeWidth={2.5} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <IconBook size={28} strokeWidth={1.5} style={{ color: "var(--foreground-muted)" }} />
                </div>
                <h3 className="font-bold mb-1" style={{ color: "var(--ink-900)" }}>কোর্স শীঘ্রই আসছে</h3>
                <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>অ্যাডমিন প্যানেল থেকে কোর্স যুক্ত করলে এখানে দেখাবে।</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HERO — Asymmetric editorial split (Top-aligned, pro layout)
          ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-16 border-b border-border"
        style={{ background: "var(--cream-100)" }}>

        {/* Warm ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-[55%] h-full"
            style={{ background: "linear-gradient(135deg, var(--cream-300) 0%, var(--cream-200) 100%)" }} />
          <div className="absolute right-[45%] top-0 bottom-0 w-24"
            style={{ background: "linear-gradient(90deg, var(--cream-100), transparent)" }} />
          {/* Warm orb */}
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-40 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(200, 144, 10, 0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <div className="container-max relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Left: Editorial text block (Top-aligned cleanly) */}
            <div className="flex flex-col justify-start lg:pr-10 pt-1 sm:pt-2">

              {/* Eyebrow */}
              <div className="eyebrow mb-3 sm:mb-4">Music Production Academy</div>

              {/* Main headline */}
              <h1 className="mb-4 sm:mb-5"
                style={{ fontSize: "clamp(1.75rem, 4.2vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.15, color: "var(--ink-900)" }}>
                সংগীতকে<br />
                <span style={{ color: "var(--primary)" }}>পেশায়</span> পরিণত করুন
              </h1>

              {/* Human-written, detailed professional copy */}
              <div className="space-y-3 mb-6 sm:mb-8 max-w-xl">
                <p className="text-sm sm:text-base leading-relaxed text-foreground/85 font-medium">
                  শুধুমাত্র বিচ্ছিন্ন ইউটিউব ভিডিও দেখে প্রফেশনাল মিউজিক প্রোডাকশন আয়ত্ত করা সম্ভব নয়। EvoRise Media-তে আমাদের চিফ মেন্টর <strong>JKH Jesan</strong>-এর বাস্তব কমার্শিয়াল স্টুডিও অভিজ্ঞতার আলোকে শিখুন পূর্ণাঙ্গ অডিও সিগন্যাল চেইন, প্রিসিশন ভোকাল টিউনিং, অ্যানালগ স্যাচুরেশন এবং রেডিও-রেডি মাস্টারিং।
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-foreground/70 font-normal">
                  বেডরুম থেকে আন্তর্জাতিক ডিজিটাল প্ল্যাটফর্ম—প্রতিটি গানে কীভাবে স্পটিফাই ও অ্যাপল মিউজিকের -14 LUFS ইন্ডাস্ট্রি স্ট্যান্ডার্ড ও ট্রু-পিক হেডরুম বজায় রেখে বাণিজ্যিক লাউডনেস তৈরি করবেন, তা শিখুন সম্পূর্ণ প্র্যাকটিক্যাল বাংলা কারিকুলামে।
                </p>
              </div>

              {/* CTAs with dedicated 'বিস্তারিত জানুন' button */}
              <div className="flex flex-row gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                <a href="#courses" className="btn-primary flex-1 sm:flex-none justify-center text-xs sm:text-sm py-2.5 sm:py-3.5 px-4 sm:px-6 cursor-pointer">
                  কোর্স দেখুন
                  <span className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <IconArrowUpRight size={12} strokeWidth={2.5} />
                  </span>
                </a>
                <Link 
                  href="/about" 
                  className="btn-outline flex-1 sm:flex-none justify-center items-center gap-1.5 text-xs sm:text-sm py-2.5 sm:py-3.5 px-4 sm:px-6 group transition-all"
                  title="একাডেমির পূর্ণাঙ্গ বিবরণ ও রোডম্যাপ দেখুন"
                >
                  <span>বিস্তারিত জানুন</span>
                  <IconArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Trust pills — Practical skills, NO certificate */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {[
                  "প্র্যাকটিক্যাল প্রজেক্টস",
                  "লাইফটাইম অ্যাক্সেস",
                  "বাংলায় শিখুন",
                ].map((t) => (
                  <span key={t}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-xs"
                    style={{ background: "var(--cream-300)", border: "1px solid var(--border-strong)", color: "var(--ink-900)" }}>
                    <IconCircleCheck size={14} strokeWidth={2.5} className="text-primary shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Studio image with clean instructor badge */}
            <div className="relative hidden lg:flex items-center justify-center h-full min-h-140">

              {/* Main image */}
              <div className="relative w-full max-w-lg ml-auto"
                style={{
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-xl)",
                  aspectRatio: "4/5",
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroMentorImage}
                  alt="JKH Jesan — Music Producer & Instructor"
                  className="w-full h-full object-cover object-center"
                />
                {/* Warm gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-2/5"
                  style={{ background: "linear-gradient(to top, rgba(26, 31, 15, 0.85) 0%, rgba(26, 31, 15, 0.25) 50%, transparent 100%)" }} />

                {/* Instructor badge */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] mb-1"
                      style={{ color: "rgba(242, 237, 228, 0.7)" }}>চিফ মেন্টর · EvoRise Media</p>
                    <p className="text-xl font-black" style={{ color: "var(--cream-100)", letterSpacing: "-0.02em" }}>JKH Jesan</p>
                    <p className="text-xs font-medium" style={{ color: "rgba(242, 237, 228, 0.75)" }}>Lead Music Production Instructor</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(200, 144, 10, 0.90)", backdropFilter: "blur(12px)" }}>
                    <IconStar size={12} fill="currentColor" className="text-primary-foreground" />
                    <span className="text-xs font-bold" style={{ color: "var(--ink-900)" }}>{stats.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS STRIP — warm ink background with animated counter (SN 11)
          ════════════════════════════════════════════════════ */}
      <div style={{ background: "var(--ink-900)", position: "relative", overflow: "hidden" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200, 144, 10, 0.08) 0%, transparent 70%)" }} />
        <div className="container-max relative z-10 py-6 sm:py-10 lg:py-14">
          <AnimatedStatsCounter stats={stats} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          INSTRUCTOR — Split layout (image left, text right)
          ════════════════════════════════════════════════════ */}
      <section className="section-lg" style={{ background: "var(--cream-100)" }}>
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Image column */}
            <div className="relative order-2 lg:order-1">

              {/* Decorative offset frame */}
              <div className="hidden sm:block absolute -inset-3 rounded-3xl pointer-events-none"
                style={{ background: "var(--cream-300)", border: "1px solid var(--border)" }} />

              <div className="relative rounded-2xl overflow-hidden instructor-image-frame"
                style={{ aspectRatio: "4/5", maxWidth: "420px", margin: "0 auto", boxShadow: "var(--shadow-xl)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={aboutMentorImage}
                  alt="JKH Jesan — Lead Music Producer & Instructor"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(26, 31, 15, 0.85) 0%, rgba(26, 31, 15, 0.2) 45%, transparent 65%)" }} />

                {/* Overlay badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full mb-2 sm:mb-3"
                    style={{ background: "var(--primary)", boxShadow: "var(--shadow-gold)" }}>
                    <IconHeadphones size={11} strokeWidth={2} style={{ color: "var(--primary-foreground)" }} />
                    <span className="text-[11px] sm:text-xs font-bold" style={{ color: "var(--primary-foreground)" }}>চিফ মেন্টর · EvoRise Media</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mb-0.5 sm:mb-1" style={{ color: "var(--cream-100)", letterSpacing: "-0.03em" }}>JKH Jesan</h3>
                  <p className="text-[11px] sm:text-xs font-medium" style={{ color: "rgba(242, 237, 228, 0.75)" }}>Lead Music Producer & Head Instructor</p>
                </div>
              </div>
            </div>

            {/* Text column */}
            <div className="order-1 lg:order-2 space-y-4 sm:space-y-6 lg:space-y-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 text-primary">
                  EVORISE MEDIA LEAD MENTOR
                </p>
                <h2 style={{ color: "var(--ink-900)" }}>
                  EvoRise Media-র<br />
                  <span style={{ color: "var(--primary)" }}>চিফ মিউজিক ইন্সট্রাক্টর</span>
                </h2>
                <p className="mt-2.5 sm:mt-5 text-xs sm:text-base leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                  EvoRise Media-র সবচেয়ে অভিজ্ঞ ও বিশ্বস্ত প্রশিক্ষক JKH Jesan — যিনি সাধারণ কোনো টিউটর নন, বরং অডিও ইন্ডাস্ট্রির একজন রিয়েল-ওয়ার্ল্ড মিউজিক প্রডিউসার ও সাউন্ড ইঞ্জিনিয়ার। শতাধিক সফল শিক্ষার্থীকে তিনি FL Studio ও Ableton Live-এ কমার্শিয়াল-গ্রেড মিউজিক মেকিং শিখিয়েছেন।
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {instructorFeatures.map((f, i) => (
                  <div key={i}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-default group hover:border-[rgba(200,144,10,0.30)] hover:shadow-sm"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{ background: "var(--gold-100)", border: "1px solid var(--gold-200)" }}>
                      <f.Icon size={16} strokeWidth={1.75} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm mb-0.5" style={{ color: "var(--ink-900)" }}>{f.title}</h3>
                      <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/about" className="btn-outline inline-flex text-xs sm:text-sm py-2 px-3.5 sm:py-2.5 sm:px-4">
                আরও বিস্তারিত জানুন
                <IconArrowUpRight size={15} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHY CHOOSE US — Asymmetric bento grid
          ════════════════════════════════════════════════════ */}
      <section className="section-lg" style={{ background: "var(--cream-300)" }}>
        <div className="container-max">

          <div className="grid lg:grid-cols-12 gap-5">
            {/* Full-width header cell */}
            <div className="lg:col-span-5 feature-card flex flex-col justify-center items-center text-center p-5 sm:p-8 lg:p-10"
              style={{ background: "var(--ink-900)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(200, 144, 10, 0.15)", border: "1px solid rgba(200, 144, 10, 0.25)" }}>
                <IconTargetArrow size={22} strokeWidth={1.75} className="text-primary" />
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-primary">
                  কেন আমাদের বেছে নেবেন
                </p>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-4"
                  style={{ color: "var(--cream-100)", letterSpacing: "-0.03em" }}>
                  একটি প্ল্যাটফর্ম,<br />
                  <span style={{ color: "var(--gold)" }}>অসীম সম্ভাবনা</span>
                </h2>
                <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(242, 237, 228, 0.65)" }}>
                  শুধু কোর্স নয় — একটি সম্পূর্ণ প্র্যাকটিক্যাল লার্নিং ইকোসিস্টেম।
                </p>
              </div>
            </div>

            {/* 2-column grid of feature cards — right side */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-5">
              {whyItems.map((item, i) => (
                <div key={i} className="feature-card flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shrink-0"
                      style={{ background: "var(--gold-100)", border: "1px solid var(--gold-200)" }}>
                      <item.Icon size={18} strokeWidth={1.75} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm mb-1 sm:mb-1.5" style={{ color: "var(--ink-900)" }}>{item.title}</h3>
                    <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TESTIMONIALS — Clean White Background & Auto-advancing reviews
          ════════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-14 lg:py-20 bg-white dark:bg-background border-t border-border overflow-hidden">
        <div className="container-max">

          <div className="text-center mb-6 sm:mb-10 lg:mb-12">
            <h2 style={{ color: "var(--ink-900)" }}>
              শিক্ষার্থীরা <span style={{ color: "var(--primary)" }}>যা বলছেন</span>
            </h2>
            <p className="mt-2 text-xs sm:text-base font-medium" style={{ color: "var(--foreground-muted)" }}>
              বাস্তব অভিজ্ঞতা • হোম স্টুডিও থেকে প্রফেশনাল মিউজিক রিলিজ
            </p>
          </div>

          <TestimonialsSlider />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FAQ — Highly Professional Music Production Accordion
          ════════════════════════════════════════════════════ */}
      <HomeFAQ />

      {/* ════════════════════════════════════════════════════
          FINAL CTA — Compact, Clean White Background
          ════════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-background border-t border-border">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto">

            <div className="inline-block text-xs font-bold uppercase tracking-wider text-primary mb-3">
              আজই শুরু করুন
            </div>

            <h2 className="mb-3.5 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight"
              style={{ color: "var(--ink-900)", letterSpacing: "-0.03em" }}>
              আপনার মিউজিক জার্নি <span style={{ color: "var(--primary)" }}>শুরু হোক আজই</span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed mb-6 font-medium"
              style={{ color: "var(--foreground-muted)" }}>
              ১৫০+ শিক্ষার্থীর সাথে যোগ দিন এবং আপনার সংগীতের স্বপ্নকে বাস্তবে রূপ দিন।
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
              <Link href="/register" className="btn-primary text-xs sm:text-sm py-3 px-6">
                ফ্রি একাউন্ট তৈরি করুন
                <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <IconArrowUpRight size={12} strokeWidth={2.5} />
                </span>
              </Link>
              <Link href="/courses" className="btn-outline text-xs sm:text-sm py-3 px-6">
                কোর্স দেখুন
              </Link>
            </div>

            <p className="text-xs font-medium text-foreground/50">
              কোনো ক্রেডিট কার্ড প্রয়োজন নেই · লাইফটাইম অ্যাক্সেস ও মেন্টর সাপোর্ট
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
