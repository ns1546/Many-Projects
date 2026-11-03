"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fbEvent } from "@/components/providers/MetaPixel";
import { gtagEvent } from "@/components/providers/GoogleAnalytics";
import {
  CheckCircle2, AlertCircle, Lock, ShieldCheck,
  ArrowRight, Loader2, MessageCircle, ChevronDown, ChevronUp,
  Sparkles, Award, Zap, Copy, Check, Clock, Phone, Hash, 
  ExternalLink, RotateCcw, HelpCircle
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [course, setCourse] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Semi-automatic Gateway State
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad">("bKash");
  const [trxId, setTrxId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [showSmsHelper, setShowSmsHelper] = useState(false);
  const [rawSmsInput, setRawSmsInput] = useState("");

  // 15-Minute Countdown Timer (900 seconds)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/checkout/${courseId}`);
    }
  }, [status, router, courseId]);

  useEffect(() => {
    const fetchCourseAndSettings = async () => {
      try {
        const [courseRes, settingsRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/settings`)
        ]);

        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourse(data);
          const finalPrice = data.discountPrice && data.discountPrice < data.price ? data.discountPrice : data.price;
          fbEvent("InitiateCheckout", {
            content_name: data.title,
            content_category: "Course",
            content_ids: [data.id],
            currency: "BDT",
            value: finalPrice
          });
        }

        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          setSettings(sData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCourseAndSettings();
  }, [courseId]);

  // Countdown Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const effectivePrice = course?.discountPrice && course.discountPrice < course.price 
    ? course.discountPrice 
    : (course?.price || 0);
  const discountAmount = course?.discountPrice && course.discountPrice < course.price 
    ? (course.price - course.discountPrice) 
    : 0;

  // Dedicated gateway recipient number
  const gatewayNumber = (paymentMethod === "bKash" 
    ? settings?.bkashNumber 
    : settings?.nagadNumber) || "01841411474";

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(gatewayNumber);
    setCopiedNumber(true);
    toast.success(`${paymentMethod} নম্বর কপি করা হয়েছে!`);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(effectivePrice.toString());
    setCopiedAmount(true);
    toast.success(`টাকার পরিমাণ (${effectivePrice}) কপি করা হয়েছে!`);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  // Smart SMS Parser & TrxID Extractor
  const handleParseSms = (text: string) => {
    setRawSmsInput(text);
    if (!text.trim()) return;

    // Pattern 1: Look for TrxID / TxnId / Trx Id
    const trxMatch = text.match(/(?:TrxID|TxnId|Trx Id|Txn ID|Transaction ID|TxnID)[:\s]*([A-Za-z0-9]{8,12})/i);
    if (trxMatch && trxMatch[1]) {
      setTrxId(trxMatch[1].toUpperCase());
    }

    // Pattern 2: Look for 11 digit BD phone number (e.g. 01XXXXXXXXX)
    const phoneMatch = text.match(/(?:from|to|From|To|Number)[:\s]*(01[3-9]\d{8})/i) || text.match(/(01[3-9]\d{8})/);
    if (phoneMatch && phoneMatch[1]) {
      setSenderPhone(phoneMatch[1]);
    }

    if (trxMatch || phoneMatch) {
      toast.success("SMS থেকে TrxID স্বয়ংক্রিয়ভাবে আলাদা করা হয়েছে!");
      setShowSmsHelper(false);
    }
  };

  // Live TrxID validation
  const isBkash = paymentMethod === "bKash";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanTrx = trxId.trim().toUpperCase();
    const cleanPhone = senderPhone.trim();

    // ── 1. STRICT BKASH VS NAGAD TRXID VALIDATION ──
    if (isBkash) {
      if (cleanTrx.length !== 10) {
        setError(`ভুল TrxID! বিকাশ (bKash) Transaction ID অবশ্যই ১০ অক্ষরের হতে হবে (আপনার দেওয়া TrxID ${cleanTrx.length} অক্ষরের)।`);
        return;
      }
      if (!(/[A-Z]/.test(cleanTrx) && /[0-9]/.test(cleanTrx))) {
        setError("ভুল বিকাশ TrxID ফরম্যাট! বিকাশ TrxID-এ অবশ্যই ইংরেজি বড় হাতের অক্ষর ও সংখ্যা উভয়ই থাকতে হবে (যেমন: BL79A2K49Q)।");
        return;
      }
      if (/^(.)\1{9}$/.test(cleanTrx) || cleanTrx === "1234567890" || cleanTrx === "0123456789") {
        setError("ভুয়া বা ডামি TrxID দেওয়া যাবে না। অনুগ্রহ করে বিকাশ অ্যাপ বা SMS থেকে আসল TrxID দিন।");
        return;
      }
    } else {
      // Nagad TrxID
      if (cleanTrx.length !== 8) {
        setError(`ভুল TrxID! নগদ (Nagad) Transaction ID অবশ্যই ৮ অক্ষরের হতে হবে (আপনার দেওয়া TrxID ${cleanTrx.length} অক্ষরের)।`);
        return;
      }
      if (!/^[A-Z0-9]{8}$/.test(cleanTrx)) {
        setError("ভুল নগদ TrxID ফরম্যাট! নগদ TrxID-এ শুধুমাত্র ৮টি ইংরেজি অক্ষর ও সংখ্যা থাকতে পারে।");
        return;
      }
      if (/^(.)\1{7}$/.test(cleanTrx) || cleanTrx === "12345678") {
        setError("ভুয়া বা ডামি TrxID দেওয়া যাবে না। অনুগ্রহ করে নগদ অ্যাপ বা SMS থেকে আসল TrxID দিন।");
        return;
      }
    }

    // ── 2. STRICT SENDER PHONE VALIDATION ──
    const validBdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!validBdPhoneRegex.test(cleanPhone)) {
      setError("ভুল মোবাইল নম্বর! অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01841411474)।");
      return;
    }
    if (/^01[3-9](\d)\1{7}$/.test(cleanPhone) || cleanPhone === "01234567890") {
      setError("অকার্যকর বা ডামি মোবাইল নম্বর! আপনার ব্যবহৃত আসল ১১ ডিজিটের মোবাইল নম্বর দিন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          paymentMethod,
          trxId: cleanTrx,
          senderPhone: cleanPhone
        }),
      });

      const data = await res.json();

      if (res.ok) {
        fbEvent("Purchase", {
          content_name: course.title,
          currency: "BDT",
          value: effectivePrice,
          content_ids: [course.id],
          payment_type: paymentMethod
        });
        gtagEvent("purchase", {
          transaction_id: cleanTrx,
          value: effectivePrice,
          currency: "BDT",
          items: [{ item_name: course.title, price: effectivePrice }]
        });

        toast.success("পেমেন্ট সফল! ক্লাসরুম চালু হচ্ছে...");
        setSuccessMessage("আপনার পেমেন্ট সফলভাবে জমা নেওয়া হয়েছে এবং কোর্সে প্রবেশাধিকার দেওয়া হয়েছে। এখনই ক্লাস শুরু করুন!");
        
        // Immediate redirect to classroom or dashboard
        setTimeout(() => {
          window.location.href = data.redirectUrl || "/dashboard";
        }, 1200);
        return;
      }

      setError(data.message || "পেমেন্ট তথ্য যাচাইয়ে সমস্যা হয়েছে। অনুগ্রহ করে সঠিক তথ্য দিন।");
    } catch {
      setError("সার্ভার ত্রুটি! কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-foreground/70 font-bold text-sm">চেকআউট পেজ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60 mb-2">
            <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-primary transition-colors">কোর্সসমূহ</Link>
            <span>/</span>
            <span className="text-primary font-bold">নিরাপদ চেকআউট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            নিরাপদ পেমেন্ট ও এনরোলমেন্ট
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
              তাৎক্ষণিক অ্যাক্টিভেশন
            </span>
          </h1>
          <p className="text-sm text-foreground/75 mt-1 font-medium">
            বিকাশ বা নগদ-এ সেন্ড মানি করে TrxID দিয়ে সাথে সাথে কোর্সের সম্পূর্ণ অ্যাক্সেস পেয়ে যান।
          </p>
        </div>

        {/* Mobile Sticky Order Summary Toggle */}
        <div className="lg:hidden mb-6 bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground/70">অর্ডারের বিবরণ</span>
              <span className="font-mono font-black text-lg text-primary">৳{effectivePrice}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary">
              <span>{mobileSummaryOpen ? "লুকান" : "দেখুন"}</span>
              {mobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {mobileSummaryOpen && (
            <div className="px-5 pb-5 pt-2 border-t border-border space-y-3 bg-surface/50 text-sm">
              <div className="font-bold text-foreground">{course.title}</div>
              <div className="flex justify-between text-foreground/70">
                <span>নিয়মিত মূল্য</span>
                <span>৳{course.price}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>ডিসকাউন্ট</span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-border">
                <span>পরিশোধযোগ্য মোট</span>
                <span className="text-primary">৳{effectivePrice}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (Payment Gateway Execution) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Student Account Card */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">শিক্ষার্থী প্রোফাইল</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={13} /> লগইন ভেরিফাইড
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-extrabold text-foreground text-base">{session?.user?.name || "Student"}</p>
                  <p className="text-xs text-foreground/65 font-mono mt-0.5">{session?.user?.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-surface border border-border text-foreground/75">
                    লাইফটাইম স্টুডেন্ট
                  </span>
                </div>
              </div>
            </div>

            {/* Main Semi-Automatic Payment Gateway Box */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-md space-y-0">
              
              {/* Header with Live Countdown */}
              <div className="px-6 py-4 border-b border-border bg-surface/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-primary" />
                  <h2 className="font-black text-foreground text-base">পেমেন্ট মেথড নির্বাচন করুন</h2>
                </div>

                {/* Countdown Timer Badge */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-black border transition-colors ${
                  timeLeft < 180 
                    ? "bg-red-500/15 border-red-500/30 text-red-500 animate-pulse" 
                    : "bg-primary/10 border-primary/20 text-primary"
                }`}>
                  <Clock size={14} className={timeLeft < 180 ? "animate-spin" : ""} />
                  <span>সময় বাকি: {formatTimer(timeLeft)}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">

                {/* Gateway Selector Cards (bKash vs Nagad) */}
                <div className="grid grid-cols-2 gap-4">
                  {/* bKash Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("bKash");
                      setError("");
                    }}
                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === "bKash"
                        ? "border-[#e2136e] bg-[#e2136e]/10 shadow-[0_0_20px_rgba(226,19,110,0.15)]"
                        : "border-border bg-surface/50 hover:border-[#e2136e]/40 hover:bg-[#e2136e]/5"
                    }`}
                  >
                    {paymentMethod === "bKash" && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#e2136e] text-white flex items-center justify-center text-xs">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center">
                      <span className="font-black text-[#e2136e] text-sm tracking-tight">bKash</span>
                    </div>
                    <span className="font-extrabold text-sm text-foreground">বিকাশ (bKash)</span>
                    <span className="text-[10px] font-bold text-foreground/60 bg-surface px-2 py-0.5 rounded-full border border-border">
                      সেন্ড মানি
                    </span>
                  </button>

                  {/* Nagad Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("Nagad");
                      setError("");
                    }}
                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      paymentMethod === "Nagad"
                        ? "border-[#f7931e] bg-[#f7931e]/10 shadow-[0_0_20px_rgba(247,147,30,0.15)]"
                        : "border-border bg-surface/50 hover:border-[#f7931e]/40 hover:bg-[#f7931e]/5"
                    }`}
                  >
                    {paymentMethod === "Nagad" && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#f7931e] text-white flex items-center justify-center text-xs">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center">
                      <span className="font-black text-[#f7931e] text-sm tracking-tight">Nagad</span>
                    </div>
                    <span className="font-extrabold text-sm text-foreground">নগদ (Nagad)</span>
                    <span className="text-[10px] font-bold text-foreground/60 bg-surface px-2 py-0.5 rounded-full border border-border">
                      সেন্ড মানি
                    </span>
                  </button>
                </div>

                {/* Highlighted Gateway Number & Amount Details */}
                <div className={`p-5 rounded-2xl border transition-colors space-y-4 ${
                  paymentMethod === "bKash" 
                    ? "bg-[#e2136e]/5 border-[#e2136e]/25" 
                    : "bg-[#f7931e]/5 border-[#f7931e]/25"
                }`}>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                      <Phone size={14} className={paymentMethod === "bKash" ? "text-[#e2136e]" : "text-[#f7931e]"} />
                      নির্ধারিত {paymentMethod} পার্সোনাল নম্বর:
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-surface border border-border text-foreground/70">
                      Personal Account
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* The Number */}
                    <div>
                      <div className="font-mono text-2xl sm:text-3xl font-black text-foreground tracking-wider select-all">
                        {gatewayNumber}
                      </div>
                      <p className="text-xs text-foreground/70 font-medium mt-0.5">
                        {paymentMethod} অ্যাপ থেকে <strong>&apos;Send Money&apos; (সেন্ড মানি)</strong> করুন
                      </p>
                    </div>

                    {/* Copy Number Action */}
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className={`h-11 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                        copiedNumber 
                          ? "bg-emerald-600 text-white" 
                          : paymentMethod === "bKash"
                            ? "bg-[#e2136e] text-white hover:opacity-90"
                            : "bg-[#f7931e] text-white hover:opacity-90"
                      }`}
                    >
                      {copiedNumber ? (
                        <>
                          <Check size={16} />
                          <span>নম্বর কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>নম্বর কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Amount to send box */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-foreground/80 font-medium">পাঠাতে হবে মোট:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-primary">৳{effectivePrice}</span>
                      <button
                        type="button"
                        onClick={handleCopyAmount}
                        className="p-1 text-foreground/60 hover:text-foreground hover:bg-surface rounded-md transition-colors"
                        title="টাকার পরিমাণ কপি করুন"
                      >
                        {copiedAmount ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step by Step Instructions in Bengali */}
                <div className="bg-surface/60 border border-border rounded-xl p-4 space-y-2 text-xs">
                  <span className="font-bold text-foreground block">কীভাবে পেমেন্ট করবেন:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-foreground/75 leading-relaxed">
                    <li>আপনার <strong>{paymentMethod}</strong> মোবাইল অ্যাপ খুলুন অথবা ইউএসএসডি ডায়াল করুন।</li>
                    <li><strong>&apos;Send Money&apos; (সেন্ড মানি)</strong> অপশন বেছে নিন।</li>
                    <li>প্রাপক নম্বর হিসেবে <strong className="font-mono text-foreground select-all">{gatewayNumber}</strong> লিখুন।</li>
                    <li>টাকার পরিমাণ লিখুন <strong className="font-mono text-foreground">৳{effectivePrice}</strong>।</li>
                    <li>পাসওয়ার্ড দিয়ে সেন্ড মানি কনফার্ম করে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> টি কপি করুন।</li>
                  </ol>
                </div>

                {/* Smart TrxID Taking Engine */}
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                  
                  {/* Smart SMS Parser / Paste Helper Trigger */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                      <Hash size={15} className="text-primary" />
                      Transaction ID (TrxID) দিন *
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowSmsHelper(!showSmsHelper)}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      {showSmsHelper ? "ইনপুট মোডে ফিরুন" : "পুরো SMS পেস্ট করে অটো-এক্সট্রাক্ট"}
                    </button>
                  </div>

                  {/* Expandable Smart SMS Parser Input */}
                  {showSmsHelper && (
                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/25 space-y-2 animate-in fade-in duration-150">
                      <p className="text-[11px] text-foreground/80 font-medium">
                        বিকাশ বা নগদ থেকে পাওয়া পুরো কনফার্মেশন SMS টি নিচে পেস্ট করুন—সিস্টেম নিজে থেকেই TrxID ও নম্বর আলাদা করে নেবে:
                      </p>
                      <textarea
                        value={rawSmsInput}
                        onChange={(e) => handleParseSms(e.target.value)}
                        placeholder="বিকাশ বা নগদ থেকে আসা কনফার্মেশন SMS টি এখানে পেস্ট করুন..."
                        rows={2}
                        className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  {/* TrxID Input Field */}
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => {
                        const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                        setTrxId(clean);
                        setError("");
                      }}
                      maxLength={isBkash ? 10 : 8}
                      placeholder={isBkash ? "১০ অক্ষরের বিকাশ TrxID দিন (যেমন: BL79A2K49Q)" : "৮ অক্ষরের নগদ TrxID দিন"}
                      className="w-full h-13 bg-surface border border-border rounded-xl px-4 font-mono font-bold text-base tracking-wider text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Sender Phone Input Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                      <Phone size={14} className="text-primary" />
                      যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number) *
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setSenderPhone(val);
                        setError("");
                      }}
                      maxLength={11}
                      placeholder="01XXXXXXXXX"
                      className="w-full h-12 bg-surface border border-border rounded-xl px-4 font-mono font-bold text-base text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Error Notification Banner */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-150">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Success Notification Banner */}
                  {successMessage && (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-150">
                      <Clock size={16} className="shrink-0 animate-pulse" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !trxId.trim() || !senderPhone.trim()}
                    className="w-full h-14 bg-primary text-primary-foreground font-black text-base rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(200,144,10,0.3)] hover:shadow-[0_0_35px_rgba(200,144,10,0.5)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>যাচাই রিকোয়েস্ট পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>ভেরিফিকেশনের জন্য সাবমিট করুন</span>
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-foreground/65 font-medium">
                    <Lock size={13} className="text-primary" />
                    <span>অ্যাডমিন বিকাশ/নগদ পেমেন্ট ও TrxID স্টেটমেন্ট চেক করে কোর্স আনলক করবেন</span>
                  </div>
                </form>

              </div>
            </div>

            {/* Helpline box */}
            {settings?.whatsappNumber && (
              <div className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between text-xs">
                <span className="text-foreground/75 font-medium">পেমেন্ট করতে কোনো সমস্যা হলে:</span>
                <a
                  href={`https://wa.me/88${settings.whatsappNumber.replace(/[^0-9]/g, '').replace(/^88/, '')}?text=${encodeURIComponent(`Hello EvoRise Media, I need help regarding checkout for course: ${course?.title || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
                >
                  <MessageCircle size={14} />
                  WhatsApp সাপোর্ট
                </a>
              </div>
            )}
          </div>

          {/* Right Column (Sticky Order Summary) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-surface/50">
                <h3 className="font-black text-foreground text-base">অর্ডার সামারি</h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Course Card Preview */}
                <div className="flex gap-4 pb-6 border-b border-border">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.thumbnail || "/images/vocal-processing-course.jpg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-foreground line-clamp-2 leading-snug mb-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-primary font-bold">চিফ মেন্টর: JKH Jesan</p>
                    <p className="text-[11px] text-foreground/60 mt-0.5">EvoRise Media Academy</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between font-medium text-foreground/75">
                    <span>কোর্সের নিয়মিত ফি</span>
                    <span className="font-mono">৳{course.price}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>স্পেশাল ডিসকাউন্ট সঞ্চয়</span>
                      <span className="font-mono">-৳{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline font-black text-lg pt-3 border-t border-border">
                    <span className="text-foreground">সর্বমোট প্রদেয়</span>
                    <span className="text-primary font-mono text-2xl">৳{effectivePrice}</span>
                  </div>
                </div>

                {/* Features included */}
                <div className="pt-4 border-t border-border space-y-2.5">
                  <span className="text-xs font-bold text-foreground/80 block uppercase tracking-wider mb-1">কোর্সের সাথে যা যা পাচ্ছেন:</span>
                  {[
                    "সম্পূর্ণ কোর্সে লাইফটাইম অ্যাক্সেস",
                    "মোবাইল, ট্যাবলেট ও পিসি থেকে যেকোনো সময় ক্লাস",
                    "প্রজেক্ট সোর্স ফাইল ও প্রিসেটস ডাউনলোড",
                    "কোর্স সমাপ্তিতে অফিশিয়াল ভেরিফাইড সার্টিফিকেট",
                    "স্টুডেন্ট ডিসকর্ড ও ফেসবুক প্রাইভেট গ্রুপ সাপোর্ট",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/75">
                      <Zap size={14} className="text-primary shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Trust banner */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <Award size={20} className="text-primary shrink-0" />
                  <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                    <strong>ভেরিফাইড একাডেমি কোর্স:</strong> সফলভাবে কোর্স সম্পন্ন করলে পাচ্ছেন অফিশিয়াল সার্টিফিকেট ও ডেডিকেটেড মেন্টর সাপোর্ট।
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
