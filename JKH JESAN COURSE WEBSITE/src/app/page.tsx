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

const testimonials = [
  {
    name: "রাফি আহমেদ",
    role: "Independent Artist",
    text: "ভোকাল মিক্সিং মডিউলটা আমার সবচেয়ে বেশি কাজে লেগেছে। এই কোর্সের EQ টেকনিকগুলো ব্যবহার করে এখন একদম রেডিও-স্ট্যান্ডার্ড সাউন্ড পাচ্ছি।",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafi&backgroundColor=e8d5b7",
    rating: 5,
  },
  {
    name: "সুমাইয়া বেগম",
    role: "Music Producer",
    text: "Ableton Live-এর ওয়ার্কফ্লো নিয়ে আমার অনেক কনফিউশন ছিল। এই কোর্সে এত গোছানোভাবে প্রতিটি টুলের ব্যবহার দেখানো হয়েছে।",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sumaiya&backgroundColor=c5ddb5",
    rating: 5,
  },
  {
    name: "তানভীর হাসান",
    role: "Sound Designer",
    text: "মাস্টারিং চেইনের যে সিক্রেটগুলো ভাই শেয়ার করেছেন, সেগুলো সত্যিই প্রিমিয়াম। কোর্সটা শেষ করে আমার ২টা ট্র্যাক অলরেডি রিলিজ করেছি।",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir&backgroundColor=b7d0e8",
    rating: 5,
  },
];

const whyItems = [
  { Icon: IconTargetArrow, title: "বিশেষজ্ঞ ইন্সট্রাক্টর",   desc: "ইন্ডাস্ট্রি প্রফেশনালদের কাছ থেকে শিখুন।" },
  { Icon: IconDeviceLaptop, title: "যেকোনো ডিভাইসে",         desc: "মোবাইল, ট্যাবলেট বা পিসি — যেকোনো সময়।" },
  { Icon: IconAward,        title: "স্বীকৃত সার্টিফিকেট",     desc: "কোর্স শেষে অফিসিয়াল সার্টিফিকেট পান।" },
  { Icon: IconUsers,        title: "কমিউনিটি সাপোর্ট",        desc: "সমমনা শিক্ষার্থীদের সাথে এগিয়ে যান।" },
  { Icon: IconBolt,         title: "লাইফটাইম অ্যাক্সেস",      desc: "একবার কিনুন, চিরকাল অ্যাক্সেস পান।" },
  { Icon: IconShieldCheck,  title: "১০০% প্র্যাকটিক্যাল শিক্ষা",   desc: "বাস্তব মিউজিক প্রজেক্ট ভিত্তিক কোর্স।" },
];

const instructorFeatures = [
  { Icon: IconHeadphones, title: "প্রফেশনাল DAW শিক্ষা",  desc: "FL Studio ও Ableton Live-এ শূন্য থেকে দক্ষতা" },
  { Icon: IconAdjustments,    title: "মিক্সিং ও মাস্টারিং",  desc: "রেডিও-রেডি সাউন্ডের প্রফেশনাল টেকনিক" },
  { Icon: IconMicrophone, title: "ভোকাল প্রোডাকশন",      desc: "রেকর্ডিং থেকে ফাইনাল প্রসেসিং পর্যন্ত" },
  { Icon: IconAward,      title: "ভেরিফাইড সার্টিফিকেট", desc: "প্রতিটি কোর্স শেষে অফিসিয়াল সনদ" },
];

export const revalidate = 60;

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default async function Home() {
  let stats = {
    students: 500,
    courses: 10,
    lessons: 100,
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
      <section className="section-lg" style={{ background: "var(--cream-200)" }}>
        <div className="container-max">

          {/* Section header — NO eyebrow (eyebrow was on hero) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <h2 style={{ color: "var(--ink-900)" }}>
                জনপ্রিয় <span style={{ color: "var(--primary)" }}>কোর্সসমূহ</span>
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--foreground-muted)", maxWidth: "44ch" }}>
                প্রফেশনাল ইন্সট্রাক্টরের হাতে-কলমে শিক্ষায় সংগীতে দক্ষতা অর্জন করুন।
              </p>
            </div>
            <Link href="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors shrink-0 group">
              সব কোর্স দেখুন
              <IconArrowUpRight size={16} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? courses.map((course: any) => {
              const lessonCount = course.modules?.reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0) || 0;
              return (
                <div key={course.id} className="card group flex flex-col hover:shadow-xl hover:border-primary/60 transition-all duration-300 relative">
                  <Link href={`/courses/${course.slug}#purchase`} className="absolute inset-0 z-0" aria-label={course.title} />

                  {/* Thumbnail */}
                  <Link
                    href={`/courses/${course.slug}#purchase`}
                    className="relative aspect-video overflow-hidden block"
                    style={{ borderRadius: "1.25rem 1.25rem 0 0" }}
                    title="কোর্স প্রিভিউ ও পারচেজ করুন"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.thumbnail || "/images/vocal-processing-course.jpg"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Warm overlay */}
                    <div className="absolute inset-0 opacity-20"
                      style={{ background: "linear-gradient(135deg, var(--ink-900) 0%, transparent 60%)" }} />

                    {/* Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="badge badge-gold text-[10px]">মিউজিক</span>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(242, 237, 228, 0.92)", backdropFilter: "blur(12px)", color: "var(--ink-900)", border: "1px solid var(--border)" }}>
                      <IconStar size={10} fill="#C8900A" style={{ color: "#C8900A" }} />
                      {course.rating || "4.9"}
                    </div>

                    {/* Play button hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: "var(--primary)", boxShadow: "var(--shadow-gold)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
                          style={{ color: "var(--primary-foreground)", marginLeft: "2px" }}>
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5 flex flex-col grow" style={{ background: "var(--surface-raised)" }}>
                    <Link href={`/courses/${course.slug}`}>
                      <h3 className="font-bold text-base leading-snug mb-2 hover:text-primary transition-colors duration-200 line-clamp-2"
                        style={{ color: "var(--ink-900)" }}>
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-sm leading-relaxed line-clamp-2 mb-5"
                      style={{ color: "var(--foreground-muted)" }}>
                      {course.description || "প্রফেশনাল মিউজিক প্রোডাকশনের সম্পূর্ণ গাইড।"}
                    </p>

                    <div className="mt-auto">
                      <div className="flex items-center gap-4 text-xs font-semibold mb-4 pb-4"
                        style={{ color: "var(--foreground-muted)", borderBottom: "1px solid var(--border)" }}>
                        <span className="flex items-center gap-1.5">
                          <IconBook size={11} strokeWidth={2} /> {lessonCount} লেসন
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IconBolt size={11} strokeWidth={2} /> লাইফটাইম
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IconAward size={11} strokeWidth={2} /> সার্টিফিকেট
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div>
                          <span className="text-[11px] block font-bold leading-none mb-1" style={{ color: "var(--foreground-muted)" }}>কোর্স ফি</span>
                          <span className="text-xl font-black" style={{ color: "var(--ink-900)", letterSpacing: "-0.04em" }}>৳{course.price}</span>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                          <Link
                            href={`/courses/${course.slug}`}
                            className="text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 hover:bg-surface hover:text-foreground"
                            style={{ background: "var(--surface)", color: "var(--foreground-muted)", border: "1px solid var(--border)" }}
                          >
                            বিস্তারিত
                          </Link>
                          <Link
                            href={`/checkout/${course.id}`}
                            className="btn-primary text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
                            style={{ background: "var(--primary)", color: "var(--ink-900)" }}
                          >
                            <span>এখনই কিনুন</span>
                            <IconArrowUpRight size={13} strokeWidth={2.5} />
                          </Link>
                        </div>
                      </div>
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
          HERO — Asymmetric editorial split
          ════════════════════════════════════════════════════ */}
      <section className="relative flex items-center overflow-hidden py-6 sm:py-12 lg:py-20"
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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center lg:min-h-[calc(100dvh-6rem)]">

            {/* Left: Editorial text block */}
            <div className="py-4 sm:py-10 lg:py-24 lg:pr-16 flex flex-col justify-center">

              {/* Eyebrow */}
              <div className="eyebrow mb-4 sm:mb-6">Music Production Academy</div>

              {/* Main headline */}
              <h1 className="mb-4 sm:mb-6"
                style={{ fontSize: "clamp(1.9rem, 5.5vw, 4.2rem)", fontWeight: 900, letterSpacing: "-0.038em", lineHeight: 1.1, color: "var(--ink-900)" }}>
                সংগীতকে<br />
                <span style={{ color: "var(--primary)" }}>পেশায়</span> পরিণত করুন
              </h1>

              <p className="mb-6 sm:mb-10 text-sm sm:text-base leading-relaxed sm:leading-[1.85]" style={{ color: "var(--foreground-muted)", maxWidth: "38ch" }}>
                EvoRise Media-তে আমাদের চিফ মেন্টর JKH Jesan-এর সাথে মিক্সিং, মাস্টারিং এবং সাউন্ড ডিজাইন শিখুন একদম শূন্য থেকে।
              </p>

              {/* CTAs */}
              <div className="flex flex-row gap-2.5 sm:gap-3 mb-6 sm:mb-12">
                <Link href="/courses" className="btn-primary flex-1 sm:flex-none justify-center text-xs sm:text-sm py-2.5 sm:py-3.5 px-4 sm:px-6">
                  কোর্স দেখুন
                  <span className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <IconArrowUpRight size={12} strokeWidth={2.5} />
                  </span>
                </Link>
                <Link href="/about" className="btn-outline flex-1 sm:flex-none justify-center text-xs sm:text-sm py-2.5 sm:py-3.5 px-4 sm:px-6">
                  আরও জানুন
                </Link>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {[
                  "প্র্যাকটিক্যাল প্রজেক্টস",
                  "লাইফটাইম অ্যাক্সেস",
                  "বাংলায় শিখুন",
                ].map((t) => (
                  <span key={t}
                    className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full"
                    style={{ background: "var(--cream-300)", border: "1px solid var(--border-strong)", color: "var(--foreground-muted)" }}>
                    <IconCircleCheck size={11} strokeWidth={2} className="text-primary" />
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
          STATS STRIP — warm ink background
          ════════════════════════════════════════════════════ */}
      <div style={{ background: "var(--ink-900)", position: "relative", overflow: "hidden" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200, 144, 10, 0.08) 0%, transparent 70%)" }} />
        <div className="container-max relative z-10 py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 md:divide-x"
            style={{ borderColor: "rgba(242, 237, 228, 0.08)" }}>
            {[
              { value: `${stats.students}+`, label: "সক্রিয় শিক্ষার্থী",  Icon: IconUsers },
              { value: `${stats.lessons}+`,  label: "প্রিমিয়াম লেসন",      Icon: IconBook },
              { value: "৪.৯/৫",             label: "গড় রেটিং",             Icon: IconStar },
              { value: "লাইফটাইম",           label: "অ্যাক্সেস",             Icon: IconBolt },
            ].map(({ value, label, Icon }, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-0 rounded-xl sm:rounded-none bg-white/[0.03] sm:bg-transparent border border-white/[0.06] sm:border-0 pl-3 md:pl-8 first:pl-0">
                <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(200, 144, 10, 0.12)", border: "1px solid rgba(200, 144, 10, 0.20)" }}>
                  <Icon size={18} strokeWidth={1.75} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-lg sm:text-xl leading-none mb-1 truncate"
                    style={{ color: "var(--cream-100)", letterSpacing: "-0.04em" }}>{value}</p>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate"
                    style={{ color: "rgba(242, 237, 228, 0.55)" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
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
              <div className="absolute -inset-3 rounded-3xl pointer-events-none"
                style={{ background: "var(--cream-300)", border: "1px solid var(--border)" }} />

              <div className="relative rounded-2xl overflow-hidden"
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
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                    style={{ background: "var(--primary)", boxShadow: "var(--shadow-gold)" }}>
                    <IconAward size={12} strokeWidth={2} style={{ color: "var(--primary-foreground)" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--primary-foreground)" }}>চিফ মেন্টর · EvoRise Media</span>
                  </div>
                  <h3 className="text-2xl font-black mb-1" style={{ color: "var(--cream-100)", letterSpacing: "-0.03em" }}>JKH Jesan</h3>
                  <p className="text-xs font-medium" style={{ color: "rgba(242, 237, 228, 0.75)" }}>Lead Music Producer & Head Instructor</p>
                </div>
              </div>
            </div>

            {/* Text column */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3 text-primary">
                  EvoRise Media লিড মেন্টর
                </p>
                <h2 style={{ color: "var(--ink-900)" }}>
                  EvoRise Media-র<br />
                  <span style={{ color: "var(--primary)" }}>চিফ মিউজিক ইন্সট্রাক্টর</span>
                </h2>
                <p className="mt-5 text-base leading-[1.85]" style={{ color: "var(--foreground-muted)" }}>
                  EvoRise Media-র সবচেয়ে অভিজ্ঞ ও বিশ্বস্ত প্রশিক্ষক JKH Jesan — যিনি সাধারণ কোনো টিউটর নন, বরং অডিও ইন্ডাস্ট্রির একজন রিয়েল-ওয়ার্ল্ড মিউজিক প্রডিউসার ও সাউন্ড ইঞ্জিনিয়ার। শত শত সফল শিক্ষার্থীকে তিনি FL Studio ও Ableton Live-এ কমার্শিয়াল-গ্রেড মিউজিক মেকিং শিখিয়েছেন।
                </p>
              </div>

              <div className="space-y-3">
                {instructorFeatures.map((f, i) => (
                  <div key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 cursor-default group hover:border-[rgba(200,144,10,0.30)] hover:shadow-sm"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{ background: "var(--gold-100)", border: "1px solid var(--gold-200)" }}>
                      <f.Icon size={18} strokeWidth={1.75} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--ink-900)" }}>{f.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/about" className="btn-outline inline-flex">
                আরও বিস্তারিত জানুন
                <IconArrowUpRight size={16} strokeWidth={2} />
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
            <div className="lg:col-span-5 feature-card flex flex-col justify-between"
              style={{ background: "var(--ink-900)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8"
                style={{ background: "rgba(200, 144, 10, 0.15)", border: "1px solid rgba(200, 144, 10, 0.25)" }}>
                <IconTargetArrow size={22} strokeWidth={1.75} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "rgba(200, 144, 10, 0.70)" }}>
                  কেন আমাদের বেছে নেবেন
                </p>
                <h2 className="text-3xl font-black leading-tight mb-4"
                  style={{ color: "var(--cream-100)", letterSpacing: "-0.03em" }}>
                  একটি প্ল্যাটফর্ম,<br />
                  <span style={{ color: "var(--gold)" }}>অসীম সম্ভাবনা</span>
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(242, 237, 228, 0.55)" }}>
                  শুধু কোর্স নয় — একটি সম্পূর্ণ লার্নিং ইকোসিস্টেম।
                </p>
              </div>
            </div>

            {/* 2-column grid of feature cards — right side (2 cols on mobile for balanced density) */}
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
          TESTIMONIALS — Cards on warm background
          ════════════════════════════════════════════════════ */}
      <section className="section-lg" style={{ background: "var(--cream-100)" }}>
        <div className="container-max">

          <div className="text-center mb-14">
            <h2 style={{ color: "var(--ink-900)" }}>
              শিক্ষার্থীরা <span style={{ color: "var(--primary)" }}>যা বলছেন</span>
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--foreground-muted)" }}>
              হাজারো শিক্ষার্থীর অভিজ্ঞতা
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="feature-card flex flex-col">

                {/* Quote icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "var(--gold-100)", border: "1px solid var(--gold-200)" }}>
                  <IconQuote size={16} strokeWidth={1.75} className="text-primary" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, si) => (
                    <IconStar key={si} size={13} fill="#C8900A" style={{ color: "#C8900A" }} />
                  ))}
                </div>

                <p className="text-sm leading-[1.9] mb-6 grow"
                  style={{ color: "var(--foreground-muted)" }}>
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4"
                  style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                    style={{ border: "2px solid var(--border-strong)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--ink-900)" }}>{t.name}</p>
                    <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FINAL CTA — Ink on cream with gold accent
          ════════════════════════════════════════════════════ */}
      <section className="section-xl" style={{ background: "var(--cream-200)" }}>
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto">

            <div className="eyebrow mb-6" style={{ justifyContent: "center" }}>আজই শুরু করুন</div>

            <h2 className="mb-6"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, color: "var(--ink-900)" }}>
              আপনার মিউজিক জার্নি<br />
              <span style={{ color: "var(--primary)" }}>শুরু হোক আজই</span>
            </h2>

            <p className="text-base leading-[1.85] mb-10"
              style={{ color: "var(--foreground-muted)", maxWidth: "44ch", margin: "0 auto 2.5rem" }}>
              হাজারো শিক্ষার্থীর সাথে যোগ দিন এবং আপনার সংগীতের স্বপ্নকে বাস্তবে রূপ দিন।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register" className="btn-primary text-base">
                ফ্রি একাউন্ট তৈরি করুন
                <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <IconArrowUpRight size={13} strokeWidth={2.5} />
                </span>
              </Link>
              <Link href="/courses" className="btn-outline text-base">
                কোর্স দেখুন
              </Link>
            </div>

            <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
              কোনো ক্রেডিট কার্ড প্রয়োজন নেই · লাইফটাইম অ্যাক্সেস ও সাপোর্ট
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
