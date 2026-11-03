"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (registered) toast.success("সফলভাবে একাউন্ট তৈরি হয়েছে! লগইন করুন।", { duration: 5000 });
  }, [registered]);

  useEffect(() => {
    if (error) {
      if (error === "OAuthSignin" || error === "OAuthCallback" || error === "Configuration") {
        toast.error("গুগল লগইন সাময়িকভাবে অনুপলব্ধ। দয়া করে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।");
      } else if (error === "OAuthAccountNotLinked") {
        toast.error("এই ইমেইলটি পূর্বে সাধারণ রেজিস্ট্রেশনের মাধ্যমে যুক্ত হয়েছিল। দয়া করে পাসওয়ার্ড দিয়ে লগইন করুন।");
      } else {
        toast.error("লগইন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("লগইন সফল হয়েছে!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("গুগল লগইনে সমস্যা হয়েছে।");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full h-11 border border-border bg-surface-raised hover:bg-surface text-foreground font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-xs cursor-pointer"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        {googleLoading ? "গুগলে কানেক্ট হচ্ছে..." : "গুগল দিয়ে লগইন করুন"}
      </button>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative bg-background px-4 text-xs font-medium text-foreground/50 uppercase">
          অথবা ইমেইল দিয়ে
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3.5 text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span className="font-semibold text-xs sm:text-sm">{errorMessage}</span>
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground/80 mb-1.5">
            ইমেইল অথবা ফোন নম্বর
          </label>
          <input
            id="email"
            type="text"
            required
            placeholder="ইমেইল বা ফোন নম্বর (যেমন: 017xxxxxxxx)"
            value={formData.email}
            onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errorMessage) setErrorMessage(null); }}
            className="w-full h-11 px-4 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground/80">
              পাসওয়ার্ড
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline hover:text-primary-dark transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="আপনার পাসওয়ার্ড"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-11 px-4 pr-11 border border-border rounded-lg text-sm font-medium text-foreground placeholder-foreground/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 bg-primary text-foreground font-bold text-sm rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
              অপেক্ষা করুন...
            </span>
          ) : (
            <>লগইন করুন <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden bg-[#12160A] text-[#F8F4EC] border-r border-[#2A3319]">
        {/* Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-20 bg-primary rounded-full blur-3xl pointer-events-none" />
        </div>

        <Link href="/" className="relative z-10" aria-label="Home">
          <Logo size="lg" variant="white" />
        </Link>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
              আপনার মিউজিক
              <br />ক্যারিয়ার শুরু হোক
              <br /><span className="text-primary">আজই।</span>
            </h2>
            <p className="text-[#E2DCCE]/85 leading-relaxed text-sm">বাংলাদেশের সেরা মিউজিক প্রোডাকশন প্ল্যাটফর্মে স্বাগতম।</p>
          </div>

          <div className="space-y-3">
            {[
              "প্রফেশনাল ইন্সট্রাক্টরদের কাছ থেকে শিখুন",
              "লাইফটাইম কোর্স অ্যাক্সেস পান",
              "অফিসিয়াল সার্টিফিকেট অর্জন করুন",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-[#F2EDE4]/90 font-medium">
                <div className="w-5 h-5 rounded-full bg-primary/25 border border-primary/45 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                {t}
              </div>
            ))}
          </div>

          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-primary text-sm">★★★★★</span>
            <span className="text-[#F2EDE4]/90 text-xs font-medium">৫০০+ সক্রিয় শিক্ষার্থী</span>
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

          <h1 className="text-2xl font-black text-foreground mb-1.5">স্বাগতম ফিরে আসুন</h1>
          <p className="text-foreground/80 text-sm font-medium mb-8">আপনার একাউন্টে লগইন করুন</p>

          <Suspense fallback={<div className="text-sm text-foreground/80">লোড হচ্ছে...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-foreground/80 font-medium">
              একাউন্ট নেই?{" "}
              <Link href="/register" className="text-primary font-bold hover:text-primary-dark transition-colors">
                ফ্রি রেজিস্ট্রেশন করুন
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
