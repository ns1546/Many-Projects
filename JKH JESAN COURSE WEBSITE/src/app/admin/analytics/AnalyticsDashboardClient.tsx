"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ShieldCheck, 
  Eye, 
  Smartphone, 
  MapPin, 
  Clock, 
  Play, 
  Award,
  ArrowUpRight,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { toast } from "sonner";

interface AnalyticsProps {
  initialSettings: {
    googleAnalyticsId?: string | null;
    facebookPixelId?: string | null;
  };
  metrics: {
    totalStudents: number;
    totalRevenue: number;
    completedOrders: number;
    pendingOrders: number;
    conversionRate: string;
    totalCompletedLessons: number;
    totalEnrollments: number;
  };
  charts: {
    revenueTimeline: { name: string; revenue: number }[];
    registrationTimeline: { name: string; students: number }[];
    coursePerformance: { name: string; students: number; revenue: number }[];
  };
  recentActivity: {
    id: string;
    userName: string;
    userEmail: string;
    lessonTitle?: string;
    completedAt: string;
  }[];
}

export default function AnalyticsDashboardClient({
  initialSettings,
  metrics,
  charts,
  recentActivity
}: AnalyticsProps) {
  const [gaId, setGaId] = useState(initialSettings.googleAnalyticsId || "");
  const [saving, setSaving] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"revenue" | "students">("revenue");

  const isGaConfigured = Boolean(gaId && gaId.trim().startsWith("G-"));

  const handleSaveGaId = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAnalyticsId: gaId.trim() || null }),
      });

      if (!res.ok) {
        throw new Error("সংরক্ষণ করা যায়নি");
      }

      toast.success("Google Analytics Measurement ID সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "সার্ভার ত্রুটি");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2A3319]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>সিস্টেম অ্যানালিটিক্স ও ইউজার ট্র্যাকিং হাব</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            অ্যানালিটিক্স ও আচরণ বিশ্লেষণ
          </h1>
          <p className="text-white/70 text-sm mt-1">
            ভিজিটর আচরণ, গুগল অ্যানালিটিক্স ৪ (GA4), রূপান্তর ফানেল এবং লাইভ শিক্ষার্থী অগ্রগতি।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://analytics.google.com/analytics/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all shadow-xs"
          >
            <span>Google Analytics কনসোল</span>
            <ExternalLink size={13} className="text-primary" />
          </a>
        </div>
      </div>

      {/* ── Google Analytics 4 (GA4) Live Command Card ──────────── */}
      <section className="bg-gradient-to-br from-[#1A220F] via-[#12160A] to-[#0E1208] border-2 border-primary/40 rounded-2xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-[#2A3319]">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center font-black shadow-md">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Google Analytics ৪ (GA4) ট্র্যাকিং সিস্টেম
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isGaConfigured ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        লাইভ সক্রিয় ({gaId})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                        <AlertCircle size={12} />
                        আইডি কনফিগারেশন প্রয়োজন
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed pt-1">
                Google Analytics ৪ আপনার ওয়েবসাইটে আসা প্রতিটি ইউজারের রিয়েল-টাইম আচরণ, অবস্থান, ডিভাইস ও পারচেজ ফানেল ট্র্যাক করে। নিচে আপনার <strong>Measurement ID (G-XXXXXXXXXX)</strong> লিখে সেভ করুন।
              </p>
            </div>

            {/* Quick GA ID Form */}
            <form onSubmit={handleSaveGaId} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={gaId}
                  onChange={(e) => setGaId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full h-11 px-3.5 bg-black/60 border border-[#2A3319] focus:border-primary text-white font-mono text-sm rounded-xl focus:outline-none transition-all placeholder:text-white/30"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-5 rounded-xl bg-primary hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>{saving ? "সেভ হচ্ছে..." : "আইডি সেভ করুন"}</span>
              </button>
            </form>
          </div>

          {/* 4 Pillars of GA4 User Behavior Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                <Eye size={17} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">রিয়েলটাইম পেজভিউ ও স্ক্রল</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                ইউজাররা হোমপেজ, কোর্স পেজ বা কারিকুলামে কতক্ষণ সময় কাটাচ্ছে এবং কতদূর স্ক্রল করছে।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3">
                <MapPin size={17} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">ভৌগোলিক এলাকা ও সিটি</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                ঢাকা, চট্টগ্রাম, সিলেট কিংবা প্রবাস থেকে কারা আপনার মিউজিক কোর্স সার্চ করে ভিজিট করছে।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3">
                <Smartphone size={17} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">ডিভাইস ও ব্রাউজার অনুপাত</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                মোবাইল ইউজারদের শতকরা হার (Android vs iPhone) এবং তারা কোন সোশ্যাল নেটওয়ার্ক থেকে আসছে।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3">
                <TrendingUp size={17} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">ই-কমার্স পারচেজ ফানেল</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                কোর্স সিলেক্ট $\rightarrow$ পেমেন্ট গেটওয়ে $\rightarrow$ সফল এনরোলমেন্টের প্রতিটি ড্রপ-অফ পয়েন্ট।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Performance Indicators (KPIs) ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="bg-[#12160A] border border-[#2A3319] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/70">মোট শিক্ষার্থী</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {metrics.totalStudents.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowUpRight size={12} />
              <span>নিবন্ধিত ও সক্রিয় একাউন্ট</span>
            </div>
          </div>
        </div>

        <div className="bg-[#12160A] border border-[#2A3319] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/70">মোট লাইফটাইম রেভিনিউ</span>
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-primary">
              ৳{metrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-white/60 mt-1">
              {metrics.completedOrders}টি অনুমোদিত সফল অর্ডার
            </div>
          </div>
        </div>

        <div className="bg-[#12160A] border border-[#2A3319] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/70">প্ল্যাটফর্ম রূপান্তর হার</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {metrics.conversionRate}%
            </div>
            <div className="text-[11px] font-semibold text-white/60 mt-1">
              ভিজিটর থেকে পেইড শিক্ষার্থী
            </div>
          </div>
        </div>

        <div className="bg-[#12160A] border border-[#2A3319] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/70">সম্পন্ন ক্লাস/লেসন</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400">
              {metrics.totalCompletedLessons}
            </div>
            <div className="text-[11px] font-semibold text-white/60 mt-1">
              মোট {metrics.totalEnrollments}টি অ্যাক্টিভ এনরোলমেন্টে
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Visual Charts ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. Main Timeline Chart (Col 1-8) */}
        <div className="lg:col-span-8 bg-[#12160A] border border-[#2A3319] p-5 sm:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#2A3319]">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                গত ১৪ দিনের পারফরম্যান্স ট্রেন্ড
              </h2>
              <p className="text-xs text-white/60">
                দৈনিক সেলস রেভিনিউ এবং শিক্ষার্থী বৃদ্ধি পর্যবেক্ষণ করুন
              </p>
            </div>

            {/* Chart toggle pill */}
            <div className="inline-flex p-1 bg-black/50 border border-[#2A3319] rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setActiveChartTab("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeChartTab === "revenue"
                    ? "bg-primary text-black shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                রেভিনিউ (৳)
              </button>
              <button
                onClick={() => setActiveChartTab("students")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeChartTab === "students"
                    ? "bg-primary text-black shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                নতুন শিক্ষার্থী
              </button>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === "revenue" ? (
                <AreaChart data={charts.revenueTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8900A" stopOpacity={0.65} />
                      <stop offset="95%" stopColor="#C8900A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,144,10,0.15)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(248,244,236,0.35)" tick={{ fill: "rgba(248,244,236,0.75)", fontSize: 11 }} />
                  <YAxis stroke="rgba(248,244,236,0.35)" tick={{ fill: "rgba(248,244,236,0.75)", fontSize: 11 }} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1F0F", borderColor: "#C8900A", borderRadius: "8px", color: "#fff" }}
                    formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, "রেভিনিউ"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C8900A" strokeWidth={3} fill="url(#analyticsRevenue)" />
                </AreaChart>
              ) : (
                <BarChart data={charts.registrationTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(248,244,236,0.35)" tick={{ fill: "rgba(248,244,236,0.75)", fontSize: 11 }} />
                  <YAxis stroke="rgba(248,244,236,0.35)" tick={{ fill: "rgba(248,244,236,0.75)", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A1F0F", borderColor: "#3B82F6", borderRadius: "8px", color: "#fff" }}
                    formatter={(value: any) => [`${value} জন`, "শিক্ষার্থী নিবন্ধন"]}
                  />
                  <Bar dataKey="students" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Top Performing Courses (Col 9-12) */}
        <div className="lg:col-span-4 bg-[#12160A] border border-[#2A3319] p-5 sm:p-6 rounded-2xl flex flex-col">
          <div className="mb-4 pb-3 border-b border-[#2A3319]">
            <h2 className="text-base sm:text-lg font-black text-white">
              শীর্ষ কোর্স ও জনপ্রিয়তা
            </h2>
            <p className="text-xs text-white/60">
              এনরোলমেন্ট ও উপার্জনের ভিত্তিতে র‍্যাংকিং
            </p>
          </div>

          <div className="space-y-3.5 grow flex flex-col justify-start">
            {charts.coursePerformance.length > 0 ? (
              charts.coursePerformance.map((course, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {idx + 1}. {course.name}
                    </span>
                    <span className="text-xs font-black text-primary shrink-0">
                      ৳{course.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <span>এনরোলমেন্ট:</span>
                    <span className="font-bold text-white">{course.students} জন শিক্ষার্থী</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-white/50">
                এখনো কোনো কোর্স ডাটা যোগ হয়নি।
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Live Student Activity Stream ────────────────────────── */}
      <div className="bg-[#12160A] border border-[#2A3319] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2A3319]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Play size={15} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                সাম্প্রতিক লার্নিং অ্যাক্টিভিটি
              </h2>
              <p className="text-xs text-white/60">
                শিক্ষার্থীরা সম্প্রতি যে লেসনগুলো শেষ করেছে
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            রিয়েলটাইম স্ট্রিম
          </span>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-white/5">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                    {act.userName[0]?.toUpperCase() || "S"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{act.userName}</p>
                    <p className="text-[11px] text-white/60 truncate">{act.userEmail}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    <CheckCircle2 size={11} /> লেসন সম্পন্ন
                  </span>
                  <p className="text-[10px] text-white/40 mt-0.5">{act.completedAt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-white/50">
            এখনো কোনো শিক্ষার্থী লেসন সম্পন্ন করেনি।
          </div>
        )}
      </div>

    </div>
  );
}

