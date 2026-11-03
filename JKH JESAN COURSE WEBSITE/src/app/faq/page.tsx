"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "এই কোর্সটি কাদের জন্য?",
    answer:
      "যারা মিউজিক প্রোডাকশন, সাউন্ড ডিজাইন বা অডিও ইঞ্জিনিয়ারিং সম্পর্কে একদম শূন্য থেকে শিখতে চান, তাদের জন্য এই কোর্সটি উপযুক্ত। এছাড়া যারা ইতোমধ্যে কাজ করছেন কিন্তু প্রফেশনাল মিক্সিং ও মাস্টারিং শিখতে চান, তারাও উপকৃত হবেন।",
    category: "সাধারণ",
  },
  {
    question: "কোর্স করার জন্য কি দামি ল্যাপটপ বা স্টুডিও গিয়ার লাগবে?",
    answer:
      "না। একটি সাধারণ ল্যাপটপ বা কম্পিউটার এবং একটি ভালো মানের হেডফোন দিয়েই আপনি শুরু করতে পারবেন। কোর্সে দেখানো হয়েছে কিভাবে মিনিমাল সেটআপ দিয়ে প্রফেশনাল সাউন্ড তৈরি করা যায়।",
    category: "টেকনিক্যাল",
  },
  {
    question: "আমি কিভাবে পেমেন্ট করব?",
    answer:
      "আপনি বিকাশ বা নগদের মাধ্যমে ম্যানুয়ালি পেমেন্ট করতে পারবেন। কোর্স চেকআউট পেজে পেমেন্ট ইনস্ট্রাকশন দেওয়া আছে। পেমেন্ট করার পর ট্রানজেকশন আইডি দিলে অ্যাডমিন ভেরিফাই করে কোর্স আনলক করে দেবেন।",
    category: "পেমেন্ট",
  },
  {
    question: "কোর্সের মেয়াদ কতদিন?",
    answer:
      "কোর্সের অ্যাক্সেস আজীবন (Lifetime)। আপনি একবার কোর্স কিনলে যেকোনো সময়, যতবার খুশি ক্লাসগুলো দেখতে পারবেন এবং কোর্সের সব আপডেট ফ্রিতে পাবেন।",
    category: "অ্যাক্সেস",
  },
  {
    question: "আমি কি সার্টিফিকেট পাব?",
    answer:
      "হ্যাঁ, কোর্সের সবগুলো মডিউল ও অ্যাসাইনমেন্ট সফলভাবে শেষ করার পর আপনাকে একটি প্রফেশনাল কোর্স কমপ্লিশন সার্টিফিকেট প্রদান করা হবে যা আপনি সিভিতে বা লিঙ্কডইনে যুক্ত করতে পারবেন।",
    category: "সার্টিফিকেট",
  },
  {
    question: "পেমেন্ট করার পর কতক্ষণ পর কোর্স পাবো?",
    answer:
      "পেমেন্ট ভেরিফিকেশনের পর সাধারণত ২–১২ ঘণ্টার মধ্যে কোর্স অ্যাক্সেস দেওয়া হয়। অ্যাডমিন ব্যস্ত থাকলে ২৪ ঘণ্টা পর্যন্ত সময় লাগতে পারে।",
    category: "পেমেন্ট",
  },
];

const categoryColors: Record<string, string> = {
  সাধারণ: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  টেকনিক্যাল: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  পেমেন্ট: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  অ্যাক্সেস: "bg-primary/10 text-primary border-primary/20",
  সার্টিফিকেট: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function FaqItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 ${
        open ? "border-primary/40 bg-surface/10 " : "border-border bg-surface/5 hover:bg-surface/5 hover:border-border"
      }`}
    >
      <button
        className="w-full flex items-center gap-3.5 px-4 sm:px-6 py-4 sm:py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="w-7 h-7 rounded-full bg-surface/5 border border-border text-primary flex items-center justify-center text-xs font-black shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[faq.category] || "bg-surface/5 text-foreground/80 border-border"}`}>
              {faq.category}
            </span>
          </div>
          <span className="font-bold text-foreground text-sm sm:text-base leading-snug">
            {faq.question}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-foreground/80 transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-6 pb-6 pl-17">
          <p className="text-foreground/80 leading-relaxed text-sm font-medium">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 bg-background overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 bg-primary blur-3xl rounded-full" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 px-4 py-2 rounded-full text-xs font-bold text-primary mb-6 shadow-xs">
            <HelpCircle size={14} className="text-primary shrink-0" />
            <span className="leading-none">সাধারণ জিজ্ঞাসা</span>
          </div>
          <h1 className="text-foreground mb-5" style={{ letterSpacing: "-0.03em" }}>
            আপনার প্রশ্নের{" "}
            <span className="text-primary">উত্তর</span>
          </h1>
          <p className="text-foreground/80 text-lg max-w-xl mx-auto leading-relaxed">
            আমাদের কোর্স, পেমেন্ট, এবং অ্যাক্সেস সম্পর্কে সবচেয়ে বেশি জিজ্ঞেস করা প্রশ্নগুলো
          </p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <div className="bg-surface/80 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
            {[
              { label: "সক্রিয় শিক্ষার্থী", value: "৫০০+" },
              { label: "কোর্স রেটিং", value: "৪.৯/৫" },
              { label: "লাইফটাইম অ্যাক্সেস", value: "✓" },
              { label: "সার্টিফিকেট", value: "✓" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                <span className="text-primary font-black">{s.value}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ List ─────────────────────────────────────────── */}
      <section className="py-20 bg-background relative">
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Still have questions CTA ─────────────────────────── */}
      <section className="py-16 bg-surface border-t border-border relative">
        <div className="absolute inset-0 bg-size-[40px_40px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="w-14 h-14 bg-surface/5 border border-border rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MessageSquare size={24} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3" style={{ letterSpacing: "-0.02em" }}>
            আরো প্রশ্ন আছে?
          </h2>
          <p className="text-foreground/80 text-sm font-medium mb-8 max-w-md mx-auto leading-relaxed">
            উপরে আপনার প্রশ্নের উত্তর না পেলে সরাসরি আমাদের সাথে যোগাযোগ করুন। আমরা সাহায্য করতে সর্বদা প্রস্তুত।
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            যোগাযোগ করুন <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}
