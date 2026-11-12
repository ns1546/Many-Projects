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
  ExternalLink, RotateCcw, HelpCircle, Landmark, Building2
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

  // Semi-automatic Gateway State (bKash, Nagad & Bank Transfer)
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad" | "Bank">("bKash");
  const [trxId, setTrxId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  // Dedicated gateway recipient number (for mobile banking)
  const gatewayNumber = (paymentMethod === "bKash" 
    ? settings?.bkashNumber 
    : settings?.nagadNumber) || "01841411474";

  // Official Bank Account Details (BRAC Bank PLC)
  const bankDetails = {
    bankName: settings?.bankName || "BRAC Bank PLC",
    accountName: settings?.bankAccountName || "MD. NAJMUSH SHAKIB",
    accountNumber: settings?.bankAccountNumber || "1079368670001",
    branchName: settings?.bankBranch || "MIRPUR SECTION-1 BRANCH",
    routingNumber: settings?.bankRouting || "060261997",
    swiftCode: settings?.bankSwift || "BRAKBDDH",
  };

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

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} কপি করা হয়েছে!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Smart SMS Parser & TrxID Extractor
  const handleParseSms = (text: string) => {
    setRawSmsInput(text);
    if (!text.trim()) return;

    // Pattern 1: Look for TrxID / TxnId / Trx Id / Ref
    const trxMatch = text.match(/(?:TrxID|TxnId|Trx Id|Txn ID|Transaction ID|TxnID|Ref|Reference)[:\s]*([A-Za-z0-9\-_]{6,20})/i);
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

  // Live validation helpers
  const isBkash = paymentMethod === "bKash";
  const isNagad = paymentMethod === "Nagad";
  const isBank = paymentMethod === "Bank";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanTrx = trxId.trim().toUpperCase();
    const cleanPhone = senderPhone.trim();

    // ── 1. STRICT STRUCTURAL VALIDATION ACCORDING TO PAYMENT METHOD ──
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

      const validBdPhoneRegex = /^01[3-9]\d{8}$/;
      if (!validBdPhoneRegex.test(cleanPhone)) {
        setError("ভুল মোবাইল নম্বর! অনুগ্রহ করে সঠিক ১১ ডিজিটের বিকাশ মোবাইল নম্বর দিন (যেমন: 01841411474)।");
        return;
      }
      if (/^01[3-9](\d)\1{7}$/.test(cleanPhone) || cleanPhone === "01234567890") {
        setError("অকার্যকর বা ডামি মোবাইল নম্বর! আপনার ব্যবহৃত আসল ১১ ডিজিটের বিকাশ নম্বর দিন।");
        return;
      }
    } else if (isNagad) {
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

      const validBdPhoneRegex = /^01[3-9]\d{8}$/;
      if (!validBdPhoneRegex.test(cleanPhone)) {
        setError("ভুল মোবাইল নম্বর! অনুগ্রহ করে সঠিক ১১ ডিজিটের নগদ মোবাইল নম্বর দিন (যেমন: 01841411474)।");
        return;
      }
      if (/^01[3-9](\d)\1{7}$/.test(cleanPhone) || cleanPhone === "01234567890") {
        setError("অকার্যকর বা ডামি মোবাইল নম্বর! আপনার ব্যবহৃত আসল ১১ ডিজিটের নগদ নম্বর দিন।");
        return;
      }
    } else {
      // ── BANK TRANSFER VALIDATION (BRAC Bank PLC) ──
      if (cleanTrx.length < 4) {
        setError("ভুল ব্যাংক রেফারেন্স! ব্যাংক ট্রান্সফার রেফারেন্স বা ডিপোজিট স্লিপ নম্বর প্রদান করুন (কমপক্ষে ৪ অক্ষরের)।");
        return;
      }
      if (/^(.)\1{3,}$/.test(cleanTrx) || cleanTrx === "1234" || cleanTrx === "0000" || cleanTrx === "TEST") {
        setError("ভুয়া বা ডামি রেফারেন্স দেওয়া যাবে না। অনুগ্রহ করে ব্যাংক থেকে পাওয়া আসল ট্রানজেকশন রেফারেন্স দিন।");
        return;
      }
      if (cleanPhone.length < 3) {
        setError("প্রেরকের বিবরণ দিন! যে ব্যাংক একাউন্ট বা নম্বর থেকে টাকা পাঠিয়েছেন তার বিবরণ লিখুন।");
        return;
      }
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

                {/* Gateway Selector Cards (bKash, Nagad, Bank Transfer) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* bKash Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("bKash");
                      setError("");
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
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
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center">
                      <span className="font-black text-[#e2136e] text-sm tracking-tight">bKash</span>
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-foreground">বিকাশ (bKash)</span>
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
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
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
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center">
                      <span className="font-black text-[#f7931e] text-sm tracking-tight">Nagad</span>
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-foreground">নগদ (Nagad)</span>
                    <span className="text-[10px] font-bold text-foreground/60 bg-surface px-2 py-0.5 rounded-full border border-border">
                      সেন্ড মানি
                    </span>
                  </button>

                  {/* Bank Transfer Card (BRAC Bank PLC) */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("Bank");
                      setError("");
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                      paymentMethod === "Bank"
                        ? "border-[#00539C] bg-[#00539C]/10 shadow-[0_0_20px_rgba(0,83,156,0.22)]"
                        : "border-border bg-surface/50 hover:border-[#00539C]/50 hover:bg-[#00539C]/5"
                    }`}
                  >
                    {paymentMethod === "Bank" && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00539C] text-white flex items-center justify-center text-xs">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#00539C] p-1.5 shadow-sm flex items-center justify-center text-white">
                      <Landmark size={22} />
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-foreground">ব্যাংক ট্রান্সফার</span>
                    <span className="text-[10px] font-bold text-foreground/75 bg-blue-500/15 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                      BRAC Bank PLC
                    </span>
                  </button>
                </div>

                {/* ── DETAILS ACCORDING TO SELECTED PAYMENT METHOD ── */}
                {isBank ? (
                  /* ══════════════════════════════════════════════════════
                      EXECUTIVE BANK TRANSFER CARD (BRAC Bank PLC)
                      ══════════════════════════════════════════════════════ */
                  <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-b from-[#0A3B75]/15 via-blue-950/5 to-surface/80 p-5 sm:p-6 shadow-xl space-y-5">
                    
                    {/* Header Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#00539C] text-white flex items-center justify-center font-black shadow-md shrink-0">
                          <Landmark size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-foreground tracking-tight">{bankDetails.bankName}</h4>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Official Account
                            </span>
                          </div>
                          <p className="text-xs text-foreground/70 font-medium">ব্র্যাক ব্যাংক পিএলসি • যেকোনো ব্যাংক অ্যাপ বা ব্রাঞ্চ থেকে ফান্ড ট্রান্সফার করুন</p>
                        </div>
                      </div>

                      {/* Supported Channels */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          NPSB (Instant)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-border text-foreground/75">
                          BEFTN
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-border text-foreground/75">
                          RTGS
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-border text-foreground/75">
                          Branch Deposit
                        </span>
                      </div>
                    </div>

                    {/* Primary Highlight: Account Number (Largest & Clickable Copy) */}
                    <div className="bg-surface/90 border border-blue-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider block">
                          একাউন্ট নম্বর (Account Number)
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-black text-foreground tracking-widest select-all">
                          {bankDetails.accountNumber}
                        </div>
                        <p className="text-xs text-foreground/60 font-medium">
                          যেকোনো ব্যাংক অ্যাপের &apos;Fund Transfer&apos; অথবা ব্রাঞ্চ ডিপোজিটের প্রাপক একাউন্ট নম্বর
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyText(bankDetails.accountNumber, "একাউন্ট নম্বর")}
                        className={`h-11 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer shrink-0 ${
                          copiedField === "একাউন্ট নম্বর"
                            ? "bg-emerald-600 text-white"
                            : "bg-[#00539C] hover:bg-[#00427c] text-white active:scale-95"
                        }`}
                      >
                        {copiedField === "একাউন্ট নম্বর" ? (
                          <>
                            <Check size={16} />
                            <span>কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>একাউন্ট নম্বর কপি</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 4 Essential Bank Specification Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Account Name */}
                      <div className="p-3.5 rounded-xl bg-surface/80 border border-border flex items-center justify-between gap-3 shadow-2xs">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide block">একাউন্টের নাম (Account Name)</span>
                          <p className="font-mono font-black text-sm text-foreground truncate">{bankDetails.accountName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bankDetails.accountName, "একাউন্টের নাম")}
                          className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-surface rounded-lg border border-border/60 transition-colors shrink-0 cursor-pointer"
                          title="একাউন্ট নাম কপি করুন"
                        >
                          {copiedField === "একাউন্টের নাম" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>

                      {/* Branch Name */}
                      <div className="p-3.5 rounded-xl bg-surface/80 border border-border flex items-center justify-between gap-3 shadow-2xs">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide block">শাখার নাম (Branch Name)</span>
                          <p className="font-black text-sm text-foreground truncate">{bankDetails.branchName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bankDetails.branchName, "শাখার নাম")}
                          className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-surface rounded-lg border border-border/60 transition-colors shrink-0 cursor-pointer"
                          title="শাখা কপি করুন"
                        >
                          {copiedField === "শাখার নাম" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>

                      {/* Routing Number */}
                      <div className="p-3.5 rounded-xl bg-surface/80 border border-border flex items-center justify-between gap-3 shadow-2xs">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide block">রাউটিং নম্বর (Routing Number)</span>
                          <p className="font-mono font-black text-sm text-foreground truncate">{bankDetails.routingNumber}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bankDetails.routingNumber, "রাউটিং নম্বর")}
                          className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-surface rounded-lg border border-border/60 transition-colors shrink-0 cursor-pointer"
                          title="রাউটিং নম্বর কপি করুন"
                        >
                          {copiedField === "রাউটিং নম্বর" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>

                      {/* SWIFT Code */}
                      <div className="p-3.5 rounded-xl bg-surface/80 border border-border flex items-center justify-between gap-3 shadow-2xs">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wide block">সুইফট কোড (SWIFT Code - International)</span>
                          <p className="font-mono font-black text-sm text-foreground truncate">{bankDetails.swiftCode}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(bankDetails.swiftCode, "সুইফট কোড")}
                          className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-surface rounded-lg border border-border/60 transition-colors shrink-0 cursor-pointer"
                          title="সুইফট কোড কপি করুন"
                        >
                          {copiedField === "সুইফট কোড" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Amount to send box */}
                    <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                      <span className="text-foreground/80 font-bold">পাঠাতে হবে মোট কোর্স ফি:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-lg text-primary">৳{effectivePrice}</span>
                        <button
                          type="button"
                          onClick={handleCopyAmount}
                          className="p-1 text-foreground/60 hover:text-foreground hover:bg-surface rounded-md transition-colors cursor-pointer"
                          title="টাকার পরিমাণ কপি করুন"
                        >
                          {copiedAmount ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ══════════════════════════════════════════════════════
                      MOBILE BANKING DETAILS CARD (bKash & Nagad)
                      ══════════════════════════════════════════════════════ */
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
                          className="p-1 text-foreground/60 hover:text-foreground hover:bg-surface rounded-md transition-colors cursor-pointer"
                          title="টাকার পরিমাণ কপি করুন"
                        >
                          {copiedAmount ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step by Step Instructions in Bengali */}
                <div className="bg-surface/60 border border-border rounded-xl p-4 space-y-2 text-xs">
                  <span className="font-bold text-foreground block">
                    {isBank ? "কীভাবে ব্যাংক ট্রান্সফার করবেন:" : "কীভাবে পেমেন্ট করবেন:"}
                  </span>
                  {isBank ? (
                    <ol className="list-decimal list-inside space-y-1.5 text-foreground/75 leading-relaxed">
                      <li>যেকোনো ব্যাংক মোবাইল অ্যাপ (যেমন: <strong>BRAC Astha</strong>, <strong>Citytouch</strong>, <strong>EBL SKYBANKING</strong>, <strong>Cellfin</strong> ইত্যাদি) অথবা সরাসরি ব্যাংকে যান।</li>
                      <li><strong>&apos;Fund Transfer&apos; (ফান্ড ট্রান্সফার)</strong> অপশন বেছে নিয়ে <strong>NPSB (তাত্ক্ষণিক)</strong> বা <strong>BEFTN</strong> সিলেক্ট করুন।</li>
                      <li>প্রাপক ব্যাংক হিসেবে <strong>BRAC Bank PLC</strong> এবং একাউন্ট নম্বর হিসেবে <strong className="font-mono text-foreground select-all">{bankDetails.accountNumber}</strong> দিন।</li>
                      <li>টাকার পরিমাণ লিখুন <strong className="font-mono text-foreground">৳{effectivePrice}</strong>।</li>
                      <li>ট্রান্সফার সম্পন্ন করে প্রাপ্ত <strong>Transaction Reference / FT Number</strong> অথবা ডিপোজিট স্লিপ নম্বরটি নিচে প্রদান করুন।</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside space-y-1.5 text-foreground/75 leading-relaxed">
                      <li>আপনার <strong>{paymentMethod}</strong> মোবাইল অ্যাপ খুলুন অথবা ইউএসএসডি ডায়াল করুন।</li>
                      <li><strong>&apos;Send Money&apos; (সেন্ড মানি)</strong> অপশন বেছে নিন।</li>
                      <li>প্রাপক নম্বর হিসেবে <strong className="font-mono text-foreground select-all">{gatewayNumber}</strong> লিখুন।</li>
                      <li>টাকার পরিমাণ লিখুন <strong className="font-mono text-foreground">৳{effectivePrice}</strong>।</li>
                      <li>পাসওয়ার্ড দিয়ে সেন্ড মানি কনফার্ম করে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> টি কপি করুন।</li>
                    </ol>
                  )}
                </div>

                {/* Smart TrxID Taking Engine */}
                <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                  
                  {/* Smart SMS Parser / Paste Helper Trigger (for mobile banking) */}
                  {!isBank && (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                          <Hash size={15} className="text-primary" />
                          Transaction ID (TrxID) দিন *
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowSmsHelper(!showSmsHelper)}
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
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
                    </>
                  )}

                  {/* TrxID / Bank Reference Input Field */}
                  <div className="space-y-1.5">
                    {isBank && (
                      <label className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                        <Hash size={15} className="text-blue-500" />
                        Transaction Reference / ডিপোজিট স্লিপ নম্বর দিন *
                      </label>
                    )}
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => {
                        const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9\-_]/g, "");
                        setTrxId(clean);
                        setError("");
                      }}
                      maxLength={isBkash ? 10 : isNagad ? 8 : 35}
                      placeholder={
                        isBkash 
                          ? "১০ অক্ষরের বিকাশ TrxID দিন (যেমন: BL79A2K49Q)" 
                          : isNagad 
                          ? "৮ অক্ষরের নগদ TrxID দিন (যেমন: 7B92A1K9)" 
                          : "ব্যাংক অ্যাপের রেফারেন্স বা স্লিপ নম্বর (যেমন: FT2409... বা স্লিপ নং)"
                      }
                      className="w-full h-13 bg-surface border border-border rounded-xl px-4 font-mono font-bold text-sm sm:text-base tracking-wider text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Sender Phone Input Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                      <Phone size={14} className={isBank ? "text-blue-500" : "text-primary"} />
                      {isBank 
                        ? "প্রেরকের বিবরণ (নাম / একাউন্ট / মোবাইল নম্বর) *" 
                        : "যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number) *"}
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => {
                        setSenderPhone(e.target.value);
                        setError("");
                      }}
                      maxLength={isBank ? 50 : 11}
                      placeholder={
                        isBank 
                          ? "যে ব্যাংক একাউন্ট বা নম্বর থেকে টাকা পাঠিয়েছেন (যেমন: MD. KAMAL বা 017...)" 
                          : "01XXXXXXXXX"
                      }
                      className="w-full h-12 bg-surface border border-border rounded-xl px-4 font-bold text-sm sm:text-base text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
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
                    <span>
                      {isBank 
                        ? "অ্যাডমিন ব্র্যাক ব্যাংক স্টেটমেন্ট বা স্লিপ রেফারেন্স চেক করে কোর্স অনুমোদন করবেন" 
                        : "অ্যাডমিন বিকাশ/নগদ পেমেন্ট ও TrxID স্টেটমেন্ট চেক করে কোর্স আনলক করবেন"}
                    </span>
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
                    "লাইফটাইম সাপোর্ট ও প্রজেক্ট স্টেম ফাইলস",
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
                    <strong>ভেরিফাইড একাডেমি কোর্স:</strong> পাচ্ছেন কমার্শিয়াল স্টুডিও প্রজেক্ট ফাইলস, লাইফটাইম অ্যাক্সেস ও ডেডিকেটেড মেন্টর সাপোর্ট।
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
