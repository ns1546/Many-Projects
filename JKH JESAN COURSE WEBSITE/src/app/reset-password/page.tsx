"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, Lock, CheckCircle2, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="p-6 bg-surface-raised border border-border rounded-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-foreground">অকার্যকর বা অনুপস্থিত লিংক</h3>
        <p className="text-xs text-foreground/70 leading-relaxed">
          পাসওয়ার্ড রিসেট টোকেন পাওয়া যায়নি। অনুগ্রহ করে নতুন একটি রিসেট লিংক তৈরি করার জন্য আবেদন করুন।
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full h-10 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors"
        >
          নতুন রিসেট লিংক চান
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("উভয় পাসওয়ার্ড একই হতে হবে!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে");
      }

      setSuccess(true);
      toast.success(data.message || "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!");

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err: any) {
      toast.error(err.message || "একটি ত্রুটি দেখা দিয়েছে, পরে আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-surface-raised border border-primary/30 rounded-xl text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="text-lg font-bold text-foreground">পাসওয়ার্ড সফলভাবে সেট হয়েছে!</h3>
        <p className="text-xs text-foreground/70 leading-relaxed">
          আপনার অ্যাকাউন্ট এখন সম্পূর্ণ নিরাপদ। আপনাকে স্বয়ংক্রিয়ভাবে লগইন পেজে নিয়ে যাওয়া হচ্ছে...
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full h-11 bg-primary text-foreground font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors gap-2"
        >
          লগইন করুন <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="new-password" className="block text-sm font-semibold text-foreground/80 mb-1.5">
          নতুন পাসওয়ার্ড
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="কমপক্ষে ৬ অক্ষর দিন"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 pr-12 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-md transition-colors cursor-pointer z-10"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-semibold text-foreground/80 mb-1.5">
          পাসওয়ার্ড নিশ্চিত করুন
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-11 px-4 pr-12 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-md transition-colors cursor-pointer z-10"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2 cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            পাসওয়ার্ড পরিবর্তন হচ্ছে...
          </span>
        ) : (
          <>নতুন পাসওয়ার্ড সংরক্ষণ করুন <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              নতুন পাসওয়ার্ড
              <br /><span className="text-primary">সেট করুন।</span>
            </h2>
            <p className="text-[#E2DCCE]/85 leading-relaxed text-sm">
              নিরাপত্তার স্বার্থে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন যাতে বড় ও ছোট হাতের অক্ষর, সংখ্যা এবং চিহ্ন মিশ্রিত থাকে।
            </p>
          </div>

          <div className="space-y-3">
            {[
              "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড আবশ্যক",
              "bcrypt সল্টিং ও ডুয়াল হ্যাশিং সুরক্ষা",
              "সফল রিসেটের পর তাৎক্ষণিক লগইন অ্যাক্সেস",
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
            <ShieldCheck size={13} /> নিরাপত্তা যাচাইকরণ
          </div>

          <h1 className="text-2xl font-black text-foreground mb-1.5">নতুন পাসওয়ার্ড নির্ধারণ</h1>
          <p className="text-foreground/80 text-sm font-medium mb-6">
            আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড লিখুন।
          </p>

          <Suspense fallback={<div className="text-sm text-foreground/80">লোড হচ্ছে...</div>}>
            <ResetPasswordForm />
          </Suspense>

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
