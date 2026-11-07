"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tag: string;
}

const FAQS_LIST: FAQItem[] = [
  {
    id: "faq-1",
    question: "এই মিউজিক প্রোডাকশন কোর্সটি কাদের জন্য প্রযোজ্য?",
    answer: "যারা মিউজিক প্রোডাকশন, সাউন্ড ডিজাইন বা অডিও ইঞ্জিনিয়ারিং একদম শূন্য থেকে শিখতে চান—যেমন নতুন মিউজিশিয়ান, ভোকালিস্ট, গীতিকার কিংবা যারা ইতোমধ্যে FL Studio/Ableton-এ কিছু কাজ করেন কিন্তু প্রফেশনাল মিক্সিং ও রেডিও-রেডি কমার্শিয়াল মাস্টারিং আয়ত্ত করতে পারছেন না। বিগিনার থেকে ইন্টারমিডিয়েট যেকোনো লেভেলের শিক্ষার্থীর জন্য এটি একটি পূর্ণাঙ্গ প্র্যাকটিক্যাল রোডম্যাপ।",
    tag: "কারিকুলাম",
  },
  {
    id: "faq-2",
    question: "শেখার জন্য কি কোনো দামি স্টুডিও গিয়ার বা সাউন্ডকার্ড লাগবে?",
    answer: "একদমই নয়। একটি সাধারণ ল্যাপটপ বা কম্পিউটার (কমপক্ষে Core i3/i5 বা Ryzen সমমানের, ৮ জিবি র‍্যাম) এবং যেকোনো সাধারণ হেডফোন দিয়েই আপনি কোর্স শুরু করতে পারবেন। কোর্সে প্র্যাকটিক্যালি শেখানো হয়েছে কীভাবে একদম বাজেট ও হোম স্টুডিও সেটআপেই আন্তর্জাতিক রেডিও-স্ট্যান্ডার্ড (-14 LUFS) সাউন্ড প্রোডাকশন করা যায়।",
    tag: "হার্ডওয়্যার",
  },
  {
    id: "faq-3",
    question: "কাজ করতে গিয়ে কোনো সমস্যা হলে মেন্টর সাপোর্ট কীভাবে পাব?",
    answer: "প্রতিটি শিক্ষার্থীর জন্য রয়েছে আমাদের এক্সক্লুসিভ প্রাইভেট লার্নার্স কমিউনিটি এবং সরাসরি WhatsApp মেন্টর সাপোর্ট। প্রজেক্ট ফাইল, মিক্সিং ব্যালান্স বা যেকোনো টেকনিক্যাল কনফিউশনে আমাদের চিফ মেন্টর JKH Jesan সরাসরি অডিও ও প্রজেক্ট রিভিউ প্রদান করেন।",
    tag: "মেন্টরশিপ",
  },
  {
    id: "faq-4",
    question: "কোর্সের অ্যাক্সেস কি লাইফটাইম (আজীবন) থাকবে?",
    answer: "হ্যাঁ, একবার এনরোল করলেই আপনি কোর্সের সমস্ত ভিডিও লেসন, স্টুডিও ফাইল এবং ভবিষ্যৎ সমস্ত আপডেটের আজীবন (Lifetime) আনলিমিটেড অ্যাক্সেস পাবেন। নিজের সময়মতো যেকোনো ডিভাইসে বারবার ক্লাস দেখতে পারবেন।",
    tag: "অ্যাক্সেস",
  },
  {
    id: "faq-5",
    question: "কোর্সের সাথে কি রিয়েল প্রজেক্ট ফাইল ও স্টেম দেওয়া হবে?",
    answer: "হ্যাঁ! প্রতিটি ক্লাসের সাথে স্টুডিও-গ্রেড মাল্টিট্র্যাক অডিও স্টেম (Vocal, Drums, Bass, Instruments), FL Studio ও Ableton প্রজেক্ট ফাইলস এবং রয়্যালটি-ফ্রি স্যাম্পল প্যাক সম্পূর্ণ বিনামূল্যে ডাউনলোডের সুযোগ রয়েছে।",
    tag: "রিসোর্স",
  },
  {
    id: "faq-6",
    question: "ক্লাসগুলো কি রেকর্ডেড নাকি লাইভ?",
    answer: "সবগুলো লেসন হাই-ডেফিনিশন ক্রিস্টাল ক্লিয়ার স্টুডিও সাউন্ডে স্টেপ-বাই-স্টেপ প্রফেশনাল রেকর্ডেড ভিডিও আকারে সাজানো, যাতে আপনি নিজের সুবিধামতো সময়ে রিপিট করে শিখতে পারেন। এর পাশাপাশি পিরিয়ডিক্যাল লাইভ ডাউট সলভিং সেশনের সুযোগও থাকে।",
    tag: "ক্লাস ফরম্যাট",
  },
];

export default function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default for premium look

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-12 sm:py-20 bg-surface/40 border-t border-border relative overflow-hidden scroll-mt-16">
      <div className="container-max relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary mb-3 shadow-xs">
            <HelpCircle size={14} className="text-primary" />
            <span>সচরাচর জিজ্ঞাসা • FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: "var(--ink-900)", letterSpacing: "-0.03em" }}>
            আপনার মনে কি কোনো <span style={{ color: "var(--primary)" }}>প্রশ্ন আছে?</span>
          </h2>
          <p className="mt-2 text-xs sm:text-base font-medium max-w-xl mx-auto" style={{ color: "var(--foreground-muted)" }}>
            কোর্সে যোগদানের আগে শিক্ষার্থীরা সচরাচর যে প্রশ্নগুলো করেন—এক নজরে সব বাস্তবসম্মত উত্তর।
          </p>
        </div>

        {/* Clean, Full-Width Single-Column Accordion (Guaranteed 100% Professional) */}
        <div className="space-y-3 sm:space-y-3.5">
          {FAQS_LIST.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "border-primary/50 bg-surface shadow-md ring-1 ring-primary/25"
                    : "border-border bg-surface/80 hover:border-primary/40 hover:bg-surface cursor-pointer shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left cursor-pointer p-4 sm:p-5 gap-3"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-1">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        isOpen
                          ? "bg-primary text-black shadow-xs"
                          : "bg-surface-raised border border-border text-foreground/70"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {faq.tag}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary bg-primary/15" : "text-foreground/50 bg-background/50 border border-border/60"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1 border-t border-border/40">
                        <p className="text-xs sm:text-sm font-medium leading-relaxed text-foreground/85 pt-2">
                          {faq.answer}
                        </p>
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(index);
                            }}
                            className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            সংক্ষেপ করুন ▴
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Direct Helpline Callout */}
        <div className="mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl bg-surface border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                অন্য কোনো প্রশ্ন বা বিশেষ পরামর্শ প্রয়োজন?
              </p>
              <p className="text-[11px] sm:text-xs text-foreground/60 font-medium">
                আমাদের অফিশিয়াল WhatsApp হেল্পলাইনে সরাসরি আমাদের টিমের সাথে কথা বলুন।
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/8801607084155?text=Hello%20EvoRise%20Media%2C%20I%20have%20questions%20about%20the%20music%20production%20course"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs font-bold py-2.5 px-4.5 shrink-0 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs w-full sm:w-auto justify-center"
          >
            <span>WhatsApp-এ চ্যাট করুন</span>
            <ArrowRight size={13} />
          </a>
        </div>

      </div>
    </section>
  );
}
