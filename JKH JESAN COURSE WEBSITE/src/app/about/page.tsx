import Link from "next/link";
import {
  Award, BookOpen, Globe, Headphones, Mic,
  Music, Play, Star, Target, TrendingUp, Users, ArrowRight
} from "lucide-react";

export const metadata = {
  title: "EvoRise Media সম্পর্কে | ক্রিয়েটিভ লার্নিং ও মিউজিক একাডেমি",
  description:
    "EvoRise Media সম্পর্কে জানুন — যেখানে চিফ মিউজিক মেন্টর JKH Jesan-এর নেতৃত্বে তৈরি হচ্ছে আগামীর মিউজিক প্রডিউসার ও সাউন্ড ইঞ্জিনিয়াররা।",
};

const timeline = [
  { year: "২০১৮", event: "প্রফেশনাল মিউজিক প্রোডাকশন শুরু এবং প্রথম প্রফেশনাল স্টুডিও সেটআপ।" },
  { year: "২০১৯", event: "দেশীয় ও আন্তর্জাতিক শিল্পীদের সাথে কাজ এবং ৩০+ কমার্শিয়াল ট্র্যাক মিক্স ও মাস্টার।" },
  { year: "২০২০", event: "আন্তর্জাতিক সাউন্ড ডিজাইন প্রজেক্টে বিশেষজ্ঞতা অর্জন।" },
  { year: "২০২১", event: "EvoRise Media একাডেমি প্রতিষ্ঠা। JKH Jesan চিফ মিউজিক মেন্টর হিসেবে দায়িত্ব গ্রহণ।" },
  { year: "২০২৩", event: "৫০০+ শিক্ষার্থী সফলভাবে প্রশিক্ষণ সম্পন্ন করেন। একাডেমি সম্পূর্ণ ডিজিটাল প্ল্যাটফর্মে রূপান্তর।" },
  { year: "২০২৫", event: "বাংলাদেশের শীর্ষস্থানীয় ক্রিয়েটিভ মিডিয়া প্ল্যাটফর্ম হিসেবে স্বীকৃতি ও একাধিক প্রিমিয়াম কোর্স।" },
];

const skills = [
  { label: "FL Studio",  pct: 98 },
  { label: "Ableton Live", pct: 92 },
  { label: "Pro Tools", pct: 85 },
  { label: "Mixing",    pct: 97 },
  { label: "Mastering", pct: 94 },
  { label: "Sound Design", pct: 90 },
];

const awards = [
  { icon: Award,    text: "বাংলাদেশ মিউজিক প্রোডাকশন অ্যাওয়ার্ড ২০২২" },
  { icon: Star,     text: "বেস্ট অনলাইন ইন্সট্রাক্টর — ৪.৯/৫ রেটিং" },
  { icon: Users,    text: "৫০০+ সফল শিক্ষার্থী" },
  { icon: BookOpen, text: "১০+ প্রিমিয়াম কোর্স প্রকাশিত" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ══════════════════════════════════════════════════════
          HERO — Dark header
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 bg-background">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-15 bg-primary blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 px-4 py-2 rounded-full text-xs font-bold text-primary mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            আমাদের সম্পর্কে
          </div>
          <h1 className="text-foreground mb-5" style={{ letterSpacing: "-0.03em" }}>
            EvoRise Media <span className="text-primary">Academy</span>
          </h1>
          <p className="text-foreground/80 text-lg max-w-2xl mx-auto leading-relaxed">
            বাংলাদেশের শীর্ষস্থানীয় ক্রিয়েটিভ মিডিয়া ও মিউজিক একাডেমি। আমাদের লিড মেন্টর JKH Jesan-এর নির্দেশনায় এখানে তৈরি হয় আন্তর্জাতিক মানের মিউজিক ও সাউন্ড ক্রাফট।
          </p>

          {/* Sister concern official badge */}
          <div className="mt-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-surface/80 border border-primary/30 backdrop-blur-md shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-foreground/90">
              EvoRise Media হলো{" "}
              <a
                href="https://www.facebook.com/EvoRiseSolutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline inline-flex items-center gap-1"
              >
                EvoRise Solutions
                <ArrowRight size={13} className="-rotate-45" />
              </a>
              -এর একটি আধুনিক ক্রিয়েটিভ মিডিয়া ও একাডেমি প্রতিষ্ঠান।
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MISSION & STORY
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-surface relative border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Instructor card */}
            <div className="relative">
              <div className="relative aspect-4/5 max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border">
                {/* Instructor photo — Replace URL with your actual professional studio portrait */}
                <div className="h-full bg-cover bg-center bg-background"
                  style={{ backgroundImage: "url('/images/mentor-jjesan-accordion.jpg')" }}>
                  <div className="absolute inset-0 bg-background/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="inline-flex items-center gap-2 bg-primary text-foreground px-3 py-1.5 rounded-full text-xs font-bold mb-3 shadow-lg">
                      <Award size={12} /> চিফ মেন্টর · EvoRise Media
                    </div>
                    <h3 className="font-black text-2xl text-foreground">JKH Jesan</h3>
                    <p className="text-foreground/80 text-sm font-medium mt-1">Lead Music Production Instructor & Sound Designer</p>
                  </div>
                </div>
              </div>

              {/* Decorative background */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-surface/5 border border-border backdrop-blur-3xl" />
            </div>

            {/* Text */}
            <div className="space-y-7">
              <div>
                <div className="eyebrow border-border! text-foreground/80! bg-surface/5!">আমাদের মিশন ও ইন্সট্রাক্টর</div>
                <h2 className="text-foreground tracking-tight leading-tight mb-4">
                  দক্ষতার বিকাশ,{" "}
                  <span className="text-primary">আন্তর্জাতিক মানের ক্রিয়েটিভিটি</span>
                </h2>
                <p className="text-foreground/80 leading-relaxed mb-4 text-base">
                  EvoRise Media-র লক্ষ্য হলো বাংলাদেশের প্রতিটি সৃজনশীল তরুণকে বিশ্বমানের অডিও ও মিডিয়া স্কিলে পারদর্শী করে তোলা। আর এই লক্ষ্যের কেন্দ্রবিন্দুতে রয়েছেন আমাদের চিফ মেন্টর JKH Jesan।
                </p>
                <p className="text-foreground/80 leading-relaxed text-base">
                  তিনি সাধারণ কোনো থিওরিটিক্যাল টিউটর নন—তিনি ইন্ডাস্ট্রির রিয়েল-ওয়ার্ল্ড এক্সপেরিয়েন্স সমৃদ্ধ একজন মিউজিক প্রডিউসার। FL Studio থেকে শুরু করে রেডিও-রেডি মাস্টারিং পর্যন্ত, প্রতিটি সিক্রেট টেকনিক তিনি শিক্ষার্থীদের সাথে নিখুঁতভাবে শেয়ার করেন।
                </p>
              </div>

              {/* Specializations Grid instead of Progress Bars */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-bold text-foreground text-base mb-4">মূল স্পেশালাইজেশন</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill.label} className="bg-surface/5 text-foreground/80 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:border-primary/40 transition-colors">
                      {skill.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TIMELINE
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-surface border-y border-border relative">
        <div className="absolute inset-0 bg-size-[40px_40px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14">
            <div className="eyebrow border-border! text-foreground/80! bg-surface/5!" style={{ display: "inline-flex" }}>আমাদের যাত্রা</div>
            <h2 className="text-foreground tracking-tight mt-1">সাফল্যের টাইমলাইন</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-background hidden md:block" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  {/* Year bubble */}
                  <div className="relative shrink-0 hidden md:block">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center font-black text-xs shadow-lg border-4 border-white/20 relative z-10">
                      {item.year}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-surface/5 border border-border backdrop-blur-sm rounded-xl p-5 shadow-lg hover:border-primary/40 transition-colors duration-300">
                    <span className="md:hidden inline-block text-xs font-black text-primary-foreground mb-2 bg-primary px-2.5 py-1 rounded-full border border-border shadow-[0_0_10px_rgba(200,144,10,0.35)]">
                      {item.year}
                    </span>
                    <p className="text-foreground/80 leading-relaxed text-sm">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ACHIEVEMENTS
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14">
            <div className="eyebrow border-border! text-foreground/80! bg-surface/5!" style={{ display: "inline-flex" }}>অর্জনসমূহ</div>
            <h2 className="text-foreground tracking-tight mt-1">
              যা আমাদের আলাদা করে
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {awards.map((item, i) => (
              <div key={i} className="p-6 bg-surface/5 border border-border rounded-2xl hover:bg-surface/10 hover:border-primary/40 transition-all duration-300 group text-center">
                <div className="w-12 h-12 rounded-xl bg-surface/10 border border-border flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors duration-300">
                  <item.icon size={22} className="text-primary group-hover:text-foreground transition-colors" />
                </div>
                <p className="font-semibold text-sm text-foreground/80 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border">
            {[
              { value: "৫০০+", label: "সফল শিক্ষার্থী" },
              { value: "৫",    label: "বছরের অভিজ্ঞতা" },
              { value: "১০০+", label: "প্রজেক্ট" },
              { value: "৫.০",  label: "গড় রেটিং" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-foreground mb-1" style={{ letterSpacing: "-0.04em" }}>
                  {s.value}
                </div>
                <p className="text-sm text-foreground/80 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
          ══════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 bg-primary rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">
            আজই আমাদের সাথে যোগ দিন
          </h2>
          <p className="text-foreground/80 text-base mb-8 leading-relaxed">
            ৫০০+ শিক্ষার্থীর সফল যাত্রায় অংশীদার হন এবং আপনার মিউজিক ক্যারিয়ার গড়ে তুলুন।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses" className="btn-primary text-sm px-8 py-4">
              কোর্স দেখুন <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="btn-ghost-white text-sm px-8 py-4">
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
