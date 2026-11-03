"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [query, setQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleVerify = async (searchId: string) => {
    if (!searchId.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(searchId.trim())}`);
      const data = await res.json();
      if (res.ok && data.verified) {
        setResult(data);
      } else {
        setError(data.message || "কোনো ভেরিফাইড সার্টিফিকেট খুঁজে পাওয়া যায়নি।");
      }
    } catch {
      setError("সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/25 rounded-full text-xs font-bold text-primary uppercase tracking-widest mb-4">
          <ShieldCheck size={14} /> অফিশিয়াল ভেরিফিকেশন পোর্টাল
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3" style={{ letterSpacing: "-0.03em" }}>
          সার্টিফিকেট সত্যতা যাচাই
        </h1>
        <p className="text-foreground/80 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
          EvoRise Media থেকে প্রদানকৃত যেকোনো সার্টিফিকেটের সত্যতা যাচাই করতে সার্টিফিকেটের নিচের Credential ID বা শিক্ষার্থীর ইমেইল লিখুন।
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-surface/5 border border-border backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(query);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="যেমন: EVO-AB12CD-34EF অথবা শিক্ষার্থীর ইমেইল"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-surface border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-12 px-7 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shrink-0 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                যাচাই হচ্ছে...
              </>
            ) : (
              <>
                যাচাই করুন <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-surface/5 border-2 border-primary/40 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-600 dark:text-emerald-400 font-black text-sm mb-8 justify-center">
            <CheckCircle2 size={18} />
            অফিশিয়াল সার্টিফিকেট প্রমাণিত ও ভ্যালিড
          </div>

          <div className="space-y-6">
            <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-1">
                  শিক্ষার্থীর নাম
                </span>
                <h3 className="text-2xl font-black text-foreground">{result.studentName}</h3>
              </div>
              <div className="sm:text-right">
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-1">
                  Credential ID
                </span>
                <span className="font-mono text-sm font-black text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
                  {result.credentialId}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-xl border border-border">
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-primary" /> সম্পন্নকৃত কোর্স
                </span>
                <p className="font-bold text-foreground text-sm">{result.courseTitle}</p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border">
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" /> ইস্যুর তারিখ
                </span>
                <p className="font-bold text-foreground text-sm">
                  {new Date(result.completedAt).toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-xl border border-border">
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-0.5">
                  সার্টিফাইং প্রতিষ্ঠান
                </span>
                <p className="font-bold text-foreground text-sm">{result.institution || "EvoRise Media"}</p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-0.5">
                    চিফ মেন্টর
                  </span>
                  <p className="font-bold text-foreground text-sm">{result.instructor || "JKH Jesan (চিফ মেন্টর)"}</p>
                </div>
                {result.courseSlug && (
                  <Link
                    href={`/courses/${result.courseSlug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    কোর্স ভিউ করুন <ExternalLink size={12} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-500 p-6 rounded-2xl text-center space-y-2">
          <AlertCircle size={28} className="mx-auto" />
          <h4 className="font-bold text-base">যাচাইকরণ ব্যর্থ</h4>
          <p className="text-xs leading-relaxed max-w-md mx-auto">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20 border-t border-border">
      <Suspense fallback={<div className="text-center py-24 text-sm text-foreground/70">লোড হচ্ছে...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
