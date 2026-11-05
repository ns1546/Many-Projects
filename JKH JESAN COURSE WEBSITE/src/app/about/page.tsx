import Link from "next/link";
import {
  Award, BookOpen, Globe, Headphones, Mic2,
  Music2, Play, Star, Target, TrendingUp, Users, 
  ArrowRight, CheckCircle2, Sliders, ShieldCheck, 
  Sparkles, Layers, Volume2, Cpu, Radio, Zap
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "একাডেমি ওভারভিউ ও বিস্তারিত কারিকুলাম | EvoRise Media",
  description:
    "EvoRise Media Music Production Academy-র পূর্ণাঙ্গ কারিকুলাম, অডিও সিগন্যাল চেইন, চিফ মেন্টর JKH Jesan-এর প্রোডাকশন দর্শন এবং হোম স্টুডিও থেকে কমার্শিয়াল রিলিজের বিস্তারিত রোডম্যাপ।",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">

      {/* ══════════════════════════════════════════════════════
          HERO — Editorial Academy Header
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pb-24 border-b border-border bg-surface/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 opacity-15 bg-primary blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-10 w-72 h-72 opacity-10 bg-amber-500 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 px-4 py-1.5 rounded-full text-xs font-bold text-primary mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>EvoRise Media Music Academy • অফিশিয়াল ওভারভিউ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 tracking-tight leading-[1.15]">
            সংগীত সৃষ্টি থেকে <span className="text-primary">আন্তর্জাতিক রিলিজ</span>: <br className="hidden sm:inline" />
            পূর্ণাঙ্গ অডিও ইঞ্জিনিয়ারিং গাইডলাইন
          </h1>

          <p className="text-base sm:text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed font-medium mb-8">
            হোম স্টুডিও হোক বা কমার্শিয়াল সেটআপ—অডিও সিগন্যাল ফ্লো, প্রিসিশন ভোকাল প্রসেসিং, অ্যানালগ স্যাচুরেশন এবং রেডিও-রেডি মাস্টারিংয়ের প্রতিটি আধুনিক টেকনিক শিখুন বাংলা ভাষায় সরাসরি চিফ মেন্টর <strong>JKH Jesan</strong>-এর বাস্তব তত্ত্বাবধানে।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/courses" className="btn-primary text-xs sm:text-sm py-3.5 px-7">
              <span>সব কোর্স ব্রাউজ করুন</span>
              <ArrowRight size={15} />
            </Link>
            <a href="#curriculum" className="btn-outline text-xs sm:text-sm py-3.5 px-7">
              কারিকুলাম রোডম্যাপ দেখুন
            </a>
          </div>

          {/* Sister concern official badge */}
          <div className="mt-10 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-background border border-border shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-foreground/80">
              EvoRise Media হলো{" "}
              <a
                href="https://www.facebook.com/EvoRiseSolutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline"
              >
                EvoRise Solutions
              </a>
              -এর একটি অনুমোদিত ক্রিয়েটিভ একাডেমি প্ল্যাটফর্ম
            </span>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          THE PROBLEM & WHY EVORISE MEDIA IS DIFFERENT
          ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-primary">
                আমাদের উদ্দেশ্য ও দর্শন
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-snug [text-wrap:balance]">
                ইউটিউব টিউটোরিয়াল যেখানে শেষ হয়, <br className="hidden sm:inline" />
                <span className="text-primary">আমাদের একাডেমি সেখান থেকেই শুরু করে।</span>
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-medium">
                ইন্টারনেটে হাজার হাজার Music Production Tutorial রয়েছে, যা আপনাকে বিভিন্ন Plugin ও Effect-এর ব্যবহার শেখায়। কিন্তু শুধু Plugin-এর Settings জানলেই Professional Sound তৈরি করা সম্ভব নয়। একটি Vocal কেন Muddy শোনায়, কোথায় EQ ব্যবহার করবেন, কীভাবে Compression ও Pitch Correction-এর মাধ্যমে Natural এবং Balanced Vocal তৈরি করবেন—এসব বিষয় বোঝাই একজন দক্ষ Music Producer ও Audio Engineer হওয়ার গুরুত্বপূর্ণ অংশ।
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-medium">
                EvoRise Media-তে আমরা কোনো মুখস্থ Preset শেখাই না। আমরা শেখাই Professional Audio Processing-এর বাস্তব Workflow—কীভাবে Vocal Preparation করবেন, EQ ও Compression দিয়ে Sound পরিষ্কার ও নিয়ন্ত্রণ করবেন, Saturation দিয়ে Character তৈরি করবেন এবং Reverb, Delay ও Creative FX ব্যবহার করে একটি Professional Vocal Sound তৈরি করবেন।
              </p>
            </div>

            <div className="lg:col-span-6 grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Layers,
                  title: "01. অডিও সিগন্যাল চেইন সায়েন্স",
                  desc: "Clip Gain, Pre-FX Automation, EQ, Compression, Saturation ও Limiting-এর সঠিক ব্যবহার এবং একটি কার্যকর Vocal Processing Chain তৈরি করার কৌশল।"
                },
                {
                  icon: Mic2,
                  title: "02. প্রিসিশন ভোকাল টিউনিং",
                  desc: "Pitch Correction, Vocal Tuning ও Automation ব্যবহার করে Natural Vocal Character বজায় রেখে Clean ও Balanced Vocal তৈরি করার পদ্ধতি।"
                },
                {
                  icon: Volume2,
                  title: "03. প্রফেশনাল ভোকাল FX",
                  desc: "Reverb, Delay, Long Reverb, Multiband Processing ও Sidechain ব্যবহার করে Vocal-এর Depth, Space, Presence ও Creative Sound তৈরি করা।"
                },
                {
                  icon: Radio,
                  title: "04. রিয়েল-ওয়ার্ল্ড ভোকাল প্রসেসিং",
                  desc: "Abanti Sithi, Mahtim Shakib, Masha ও Porshi-এর Vocal নিয়ে সম্পূর্ণ Practical Processing Session এবং Professional Workflow শেখা।"
                }
              ].map((card, i) => (
                <div key={i} className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
                    <card.icon size={20} />
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground mb-1.5">{card.title}</h3>
                  <p className="text-xs text-foreground/70 leading-relaxed font-medium">{card.desc}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MEET CHIEF MENTOR JKH JESAN
          ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Mentor Portrait with Glass Card */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] max-h-72 sm:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-xl relative bg-zinc-950 max-w-sm mx-auto lg:max-w-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/mentor-jjesan-accordion.jpg" 
                  alt="JKH Jesan — Chief Music Mentor"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-primary text-black mb-2 shadow-sm">
                    <Award size={13} />
                    চিফ মিউজিক মেন্টর
                  </span>
                  <h3 className="text-2xl font-black text-white">JKH Jesan</h3>
                  <p className="text-xs text-white/80 font-medium">Lead Sound Designer & Music Producer</p>
                </div>
              </div>
            </div>

            {/* Right: Mentor Biography & Philosophy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-primary">
                ইন্সট্রাক্টর পরিচিতি
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-snug">
                ১৩+ বছরের বাস্তব ইন্ডাস্ট্রি অভিজ্ঞতা, <br className="hidden sm:inline" />
                <span className="text-primary">এখন আপনার হাতের মুঠোয়</span>
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-medium">
                JKH Jesan বাংলাদেশের অডিও প্রোডাকশন ও সাউন্ড ডিজাইন ইন্ডাস্ট্রির একজন অভিজ্ঞ মিউজিক প্রফেশনাল। ২০১১ সাল থেকে শুরু হওয়া তাঁর দীর্ঘ যাত্রায় তিনি কাজ করেছেন অসংখ্য বাংলা নাটকের Original Soundtrack (OST), Background Music (BGM), Cinematic Fiction এবং বিভিন্ন Commercial Audio Production নিয়ে।
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-medium">
                শুধু সাউন্ড তৈরি নয়, একটি দৃশ্যের আবেগকে সঠিক সাউন্ডের মাধ্যমে জীবন্ত করে তোলা কিংবা একটি গানকে আন্তর্জাতিক মানের শ্রবণ-অভিজ্ঞতায় রূপ দেওয়া—প্রতিটি ক্ষেত্রেই তাঁর রয়েছে শৈল্পিক চিন্তা ও নিখুঁত টেকনিক্যাল দক্ষতার সমন্বয়। Logic Pro-সহ আধুনিক অডিও প্রোডাকশন প্রযুক্তি ব্যবহারে তাঁর দক্ষতা এবং Mixing, Mastering ও Film Scoring-এর অভিজ্ঞতা তাঁকে দিয়েছে স্বতন্ত্র সাউন্ড আইডেন্টিটি।
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/80 font-medium">
                ১০০+ গুরুত্বপূর্ণ প্রজেক্ট এবং ২০+ মিলিয়ন স্ট্রিমের অভিজ্ঞতায় তাঁর কাজ পৌঁছেছে শ্রোতাদের কাছে বিভিন্ন ডিজিটাল প্ল্যাটফর্মে।
              </p>

              <div className="grid sm:grid-cols-3 gap-3 pt-3">
                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <p className="text-lg font-black text-primary">১৩+ বছর</p>
                  <p className="text-[11px] font-semibold text-foreground/70">ইন্ডাস্ট্রি অভিজ্ঞতা</p>
                </div>
                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <p className="text-lg font-black text-primary">৫০০+ শিক্ষার্থী</p>
                  <p className="text-[11px] font-semibold text-foreground/70">সরাসরি প্রশিক্ষিত</p>
                </div>
                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <p className="text-lg font-black text-primary">১০০% লাইফটাইম</p>
                  <p className="text-[11px] font-semibold text-foreground/70">কমিউনিটি সাপোর্ট</p>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline"
                >
                  <span>ইন্সট্রাক্টরের সাথে সরাসরি যোগাযোগের তথ্য দেখুন</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5-PILLAR CURRICULUM ROADMAP (Detailed Blueprint)
          ══════════════════════════════════════════════════════ */}
      <section id="curriculum" className="py-16 sm:py-24 bg-background border-b border-border scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-primary mb-2">
              প্রোডাকশন রোডম্যাপ
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
              একাডেমির ৫-স্তরের প্রফেশনাল ব্লুপ্রিন্ট
            </h2>
            <p className="mt-3 text-sm sm:text-base text-foreground/75 font-medium">
              যে ধাপে ধাপে একজন সাধারণ লার্নার পরিণত হন পূর্ণাঙ্গ কমার্শিয়াল অডিও প্রডিউসারে
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "০১",
                title: "ফাউন্ডেশন ও ইন-দ্য-বক্স অ্যারেঞ্জমেন্ট",
                tools: "FL Studio 21 • Logic Pro • Ableton Live",
                details: "ডিজিটাল অডিও ওয়ার্কস্টেশনের কোর আর্কিটেকচার, বিট গ্রুভ কোয়ান্টাইজেশন, টেম্পো ম্যাপিং, কর্ড প্রোগ্রেশন এবং ট্রানজিশন বিল্ডআপ।"
              },
              {
                step: "০২",
                title: "অ্যাডভান্সড ভোকাল কম্প্রেশন ও সার্জিক্যাল টিউনিং",
                tools: "Celemony Melodyne • Antares Auto-Tune • FabFilter Pro-Q 3",
                details: "ভোকাল কম্পিং, ন্যাচারাল পিচ সেন্টারিং, ফরম্যান্ট টিউনিং, ডি-এসার দিয়ে হার্শনেস দূর করা, এবং 1176 ও LA-2A স্টাইল ডুয়াল-কম্প্রেশন স্ট্যাকিং।"
              },
              {
                step: "০৩",
                title: "লো-এন্ড পাওয়ার ও ড্রাম বাস গ্লু",
                tools: "Sidechain Ducking • Dynamic EQ • Transient Shaper",
                details: "808 সাব-বেস এবং কিক ড্রামের ফ্রিকোয়েন্সি স্পেস তৈরি, ক্লিপিং বনাম স্যাচুরেশন, এবং ড্রাম কিটের প্যারালাল কম্প্রেশন।"
              },
              {
                step: "০৪",
                title: "থ্রি-ডি স্পেস, স্টেরিও ওয়াইডেনিং ও ডেপথ",
                tools: "Valhalla VintageVerb • Soundtoys Echoboy • Mid-Side EQ",
                details: "রিভার্ব বাস রাউটিং, ডিলে থ্রোস, হাস ইফেক্ট এবং ফেজ ক্যান্সেলেশন ছাড়া কীভাবে পুরো মিক্সকে ওয়াইড ও সিনেমাটিক বানাতে হয়।"
              },
              {
                step: "০৫",
                title: "রিয়েল-ওয়ার্ল্ড ভোকাল প্রসেসিং",
                tools: "Practical Vocal Session • Studio Workflow",
                details: "বাস্তব শিল্পীদের Vocal নিয়ে Complete Practical Processing Session। Vocal Character অনুযায়ী Processing Decision, EQ, Dynamics, Effects এবং Final Vocal Treatment-এর Professional Workflow."
              }
            ].map((p, i) => (
              <div 
                key={i} 
                className="p-6 sm:p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xl flex items-center justify-center shrink-0">
                    {p.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base sm:text-lg font-black text-foreground">{p.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/15 text-primary">
                        {p.tools}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-medium">
                      {p.details}
                    </p>
                  </div>
                </div>
                <Link 
                  href="/courses" 
                  className="shrink-0 px-4 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground hover:bg-primary hover:text-black hover:border-primary transition-all self-end md:self-auto"
                >
                  কোর্স মডিউল দেখুন
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GEAR & HARDWARE RECOMMENDATIONS FOR HOME STUDIOS
          ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              হোম স্টুডিও রিকমেন্ডেড গিয়ার
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-foreground/75 font-medium">
              দামি স্টুডিও ছাড়া ঘরে বসেই কম বাজেটে প্রফেশনাল সেটআপ গড়ার বাস্তবিক তালিকা
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-background border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Headphones size={20} />
              </div>
              <h3 className="font-extrabold text-base text-foreground">মনিটরিং হেডফোন</h3>
              <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                অ্যাকোস্টিক ট্রিটমেন্টহীন রুমে স্পিকারের চেয়ে ফ্ল্যাট রেসপন্স হেডফোন বেশি নিরাপদ। Audio-Technica ATH-M50x অথবা Beyerdynamic DT 990 Pro সেরা চয়েস।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Cpu size={20} />
              </div>
              <h3 className="font-extrabold text-base text-foreground">অডিও ইন্টারফেস</h3>
              <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                স্বচ্ছ প্রিম্প এবং লো-লেটেন্সি ড্রাইভারের জন্য Focusrite Scarlett 2i2, Audient iD14, অথবা Universal Audio Volt 276 দিয়ে শুরু করতে পারেন।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Mic2 size={20} />
              </div>
              <h3 className="font-extrabold text-base text-foreground">ভোকাল মাইক্রোফোন</h3>
              <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                ঘরোয়া রুমে ব্যাকগ্রাউন্ড নয়েজ এড়াতে Shure SM58 / SM7B ডায়নামিক মাইক্রোফোন, অথবা শান্ত পরিবেশে Rode NT1-A কন্ডেন্সার মাইক্রোফোন আদর্শ।
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA
          ══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 bg-background text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-4 tracking-tight">
            আপনার মিউজিক প্রোডাকশন ক্যারিয়ার শুরু করুন আজই
          </h2>
          <p className="text-sm sm:text-base text-foreground/75 mb-8 leading-relaxed font-medium max-w-xl mx-auto">
            ১৫০+ শিক্ষার্থীর সাথে যোগ দিন এবং আপনার ক্রিয়েটিভিটিকে দিন আন্তর্জাতিক প্রফেশনাল সাউন্ড।
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link href="/courses" className="btn-primary text-xs sm:text-sm py-3.5 px-8">
              <span>কোর্স কারিকুলাম ও এনরোলমেন্ট</span>
              <ArrowRight size={15} />
            </Link>
            <Link href="/contact" className="btn-outline text-xs sm:text-sm py-3.5 px-8">
              সরাসরি যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
