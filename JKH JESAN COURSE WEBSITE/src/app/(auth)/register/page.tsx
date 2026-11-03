"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (error) {
      if (error === "OAuthSignin" || error === "OAuthCallback" || error === "Configuration") {
        toast.error("গুগল রেজিস্ট্রেশন সাময়িকভাবে অনুপলব্ধ। দয়া করে নিচের ফর্মটি পূরণ করে রেজিস্ট্রেশন করুন।");
      } else if (error === "OAuthAccountNotLinked") {
        toast.error("এই ইমেইলটি পূর্বে তৈরি করা হয়েছে। দয়া করে লগইন পেজে গিয়ে লগইন করুন।");
      } else {
        toast.error("রেজিস্ট্রেশন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      router.push("/login?registered=true");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("গুগল দিয়ে সাইন আপ করতে সমস্যা হয়েছে।");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={googleLoading || loading}
        className="w-full h-11 border border-border bg-surface-raised hover:bg-surface text-foreground font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-xs cursor-pointer"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        {googleLoading ? "গুগলে কানেক্ট হচ্ছে..." : "গুগল দিয়ে সরাসরি একাউন্ট খুলুন"}
      </button>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative bg-background px-4 text-xs font-medium text-foreground/50 uppercase">
          অথবা তথ্য দিয়ে
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-foreground/80 mb-1.5">
            আপনার পুরো নাম
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="যেমন: আবু সাঈদ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 px-4 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground/80 mb-1.5">
            ইমেইল এড্রেস
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-11 px-4 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-foreground/80 mb-1.5">
            মোবাইল নম্বর <span className="text-xs text-foreground/50 font-normal">(ঐচ্ছিক - সহজ লগইন ও রিকভারির জন্য)</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="০১৭xxxxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-11 px-4 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-foreground/80 mb-1.5">
            পাসওয়ার্ড
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="কমপক্ষে ৬ অক্ষর"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 bg-primary text-foreground font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
              একাউন্ট তৈরি হচ্ছে...
            </span>
          ) : (
            <>ফ্রি একাউন্ট তৈরি করুন <ArrowRight size={16} /></>
          )}
        </button>

        <p className="text-xs text-foreground/80 text-center font-medium">
          রেজিস্ট্রেশন করে আপনি আমাদের{" "}
          <Link href="/terms" className="text-primary hover:underline">শর্তাবলী</Link>{" "}
          ও{" "}
          <Link href="/privacy" className="text-primary hover:underline">গোপনীয়তা নীতি</Link>{" "}
          মেনে নিচ্ছেন।
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24 lg:pt-6">
        <div className="w-full max-w-100">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 lg:hidden inline-block" aria-label="Home">
            <Logo size="sm" variant="auto" />
          </Link>

          <h1 className="text-2xl font-black text-foreground mb-1.5">একাউন্ট তৈরি করুন</h1>
          <p className="text-foreground/80 text-sm font-medium mb-8">বিনামূল্যে শুরু করুন — কোনো ক্রেডিট কার্ড প্রয়োজন নেই</p>

          <Suspense fallback={<div className="text-sm text-foreground/80">লোড হচ্ছে...</div>}>
            <RegisterForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-foreground/80 font-medium">
              আগে থেকেই একাউন্ট আছে?{" "}
              <Link href="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">
                লগইন করুন
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — Branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden bg-[#12160A] text-[#F8F4EC] border-l border-[#2A3319]">
        {/* Decorations */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-0 w-80 h-80 opacity-20 bg-primary rounded-full blur-3xl pointer-events-none" />
        </div>

        <Link href="/" className="relative z-10" aria-label="Home">
          <Logo size="lg" variant="white" />
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
              আজই যোগ দিন হাজারো
              <br /><span className="text-primary">সফল শিক্ষার্থীর</span>
              <br />সাথে।
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { title: "বিশেষজ্ঞ ইন্সট্রাক্টর", desc: "ইন্ডাস্ট্রি প্রফেশনালদের কাছ থেকে শিখুন" },
              { title: "লাইফটাইম অ্যাক্সেস", desc: "একবার কিনুন, চিরকাল ব্যবহার করুন" },
              { title: "অফিসিয়াল সার্টিফিকেট", desc: "প্রতিটি কোর্সে সার্টিফিকেট পাবেন" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={14} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-[#E2DCCE]/85 text-xs font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#A8A296] text-xs font-medium relative z-10">
          © {new Date().getFullYear()} EvoRise Media
        </p>
      </div>
    </div>
  );
}
