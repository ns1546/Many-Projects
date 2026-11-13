"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Mail, KeyRound, CheckCircle2, ArrowLeft, MailCheck } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "পাসওয়ার্ড রিসেট লিংক পাঠাতে ব্যর্থ হয়েছে");
      }

      setSubmitted(true);
      toast.success("পাসওয়ার্ড রিসেট নির্দেশাবলী পাঠানো হয়েছে!");
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে, কিছুক্ষণ পর চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden bg-[#12160A] text-[#F8F4EC] border-r border-[#2A3319]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-20 bg-primary rounded-full blur-3xl pointer-events-none" />
        </div>

        <Link href="/" className="relative z-10" aria-label="Home">
          <Logo size="lg" variant="white" />
        </Link>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
              অ্যাকাউন্ট নিরাপত্তা
              <br /><span className="text-primary">সর্বোচ্চ অগ্রাধিকার।</span>
            </h2>
            <p className="text-[#E2DCCE]/85 leading-relaxed text-sm">
              আপনার পাসওয়ার্ড রিসেট লিংকটি শুধুমাত্র আপনার ভেরিফাইড ইমেইলে সরাসরি প্রেরণ করা হয়, যাতে অননুমোদিত কেউ আপনার অ্যাকাউন্ট অ্যাক্সেস করতে না পারে।
            </p>
          </div>

          <div className="space-y-3">
            {[
              "সরাসরি আপনার ব্যক্তিগত ইনবক্সে লিংক ডেলিভারি",
              "সর্বোচ্চ এনক্রিপ্টেড ১৫ মিনিটের সিকিউরিটি টোকেন",
              "একবার ব্যবহারের পর টোকেন স্বয়ংক্রিয় নিষ্ক্রিয়করণ",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-[#F2EDE4]/90 font-medium">
                <div className="w-5 h-5 rounded-full bg-primary/25 border border-primary/45 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#A8A296] text-xs font-medium relative z-10">
          © {new Date().getFullYear()} EvoRise Media
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24 lg:pt-6">
        <div className="w-full max-w-100">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 lg:hidden inline-block" aria-label="Home">
            <Logo size="sm" variant="auto" />
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-raised border border-border rounded-full text-xs font-semibold text-primary mb-4">
            <KeyRound size={13} /> পাসওয়ার্ড রিকভারি
          </div>

          <h1 className="text-2xl font-black text-foreground mb-1.5">পাসওয়ার্ড ভুলে গেছেন?</h1>
          <p className="text-foreground/80 text-sm font-medium mb-6">
            আপনার নিবন্ধিত অ্যাকাউন্টের ইমেইল অথবা মোবাইল নম্বর দিন।
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground/80 mb-1.5">
                  ইমেইল অথবা মোবাইল নম্বর
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="text"
                    required
                    placeholder="name@example.com বা ০১৭xxxxxxxx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 pl-11 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
                  />
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    পাঠানো হচ্ছে...
                  </span>
                ) : (
                  <>রিসেট লিংক পাঠান <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-6 border border-primary/30 bg-surface-raised rounded-xl text-center space-y-3.5 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
                  <MailCheck size={28} />
                </div>
                <h3 className="text-lg font-bold text-foreground">আপনার ইনবক্স চেক করুন</h3>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  আমরা <strong>{email}</strong> এর সাথে যুক্ত অ্যাকাউন্টে একটি সুরক্ষিত পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি।
                </p>
                <div className="text-xs text-foreground/60 bg-surface-sunken p-3 rounded-lg border border-border text-left space-y-1.5">
                  <p className="flex items-center gap-2 font-medium text-foreground/80">
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                    ইমেইল পৌঁছাতে ১-২ মিনিট সময় লাগতে পারে
                  </p>
                  <p className="flex items-center gap-2 font-medium text-foreground/80">
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                    ইনবক্সে না পেলে Spam / Promotions ফোল্ডার দেখুন
                  </p>
                  <p className="flex items-center gap-2 font-medium text-foreground/80">
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                    লিংকটির মেয়াদ পরবর্তী ১৫ মিনিট পর্যন্ত থাকবে
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                }}
                className="w-full text-xs text-foreground/60 hover:text-foreground transition-colors text-center cursor-pointer"
              >
                ভুল ইমেইল দিয়েছেন? আবার চেষ্টা করুন
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft size={16} /> লগইন পেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
