"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
    // Automatic instant recovery for transient DOM / Node reconciliation races
    if (error?.message?.includes("removeChild") || error?.message?.includes("Node")) {
      const timer = setTimeout(() => {
        reset();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [error, reset]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center select-none font-sans">
      <div className="max-w-md w-full bg-surface/5 border border-border backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            কিছু একটা সমস্যা হয়েছে
          </h2>
          <p className="text-sm text-foreground/70 font-medium leading-relaxed">
            সাময়িক নেটওয়ার্ক বা সার্ভার বিভ্রাট হয়েছে। চিন্তা করবেন না, আপনার ডেটা সম্পূর্ণ নিরাপদ রয়েছে।
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-foreground/40 mt-1">
              Error Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="bg-primary text-primary-foreground font-black text-sm h-11 px-5 hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} />
            পুনরায় চেষ্টা করুন
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="border-border text-foreground font-bold text-sm h-11 px-5 hover:bg-surface/10 w-full flex items-center justify-center gap-2"
            >
              <Home size={15} />
              হোমপেজে যান
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
