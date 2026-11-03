import Link from "next/link";
import { Shield, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "গোপনীয়তা নীতি | EvoRise Media",
  description: "EvoRise Media-এর গোপনীয়তা নীতি ও ব্যক্তিগত তথ্য সুরক্ষা বিষয়ক বিস্তারিত নীতিমালা।",
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "আমরা কী তথ্য সংগ্রহ করি?",
      content:
        "একাউন্ট তৈরি এবং কোর্স ক্রয়ের সময় আমরা আপনার নাম, ইমেইল, মোবাইল নম্বর এবং ট্রানজেকশন তথ্য সংগ্রহ করি। আমরা কোনো ব্যাংক বা কার্ডের পাসওয়ার্ড বা পিন সংগ্রহ করি না।",
    },
    {
      title: "তথ্যের ব্যবহার",
      content:
        "আমরা আপনার তথ্য ব্যবহার করি মূলত কোর্স অ্যাক্সেস প্রদান, কাস্টমার সাপোর্ট এবং বিভিন্ন আপডেট সম্পর্কে আপনাকে অবগত করার জন্য। আপনার অনুমতি ছাড়া আমরা তৃতীয় পক্ষের কাছে কোনো তথ্য বিক্রি বা শেয়ার করি না।",
    },
    {
      title: "ডেটা নিরাপত্তা",
      content:
        "আপনার ব্যক্তিগত তথ্যের নিরাপত্তা নিশ্চিত করতে আমরা স্ট্যান্ডার্ড এনক্রিপশন এবং সিকিউরিটি মেজারস ব্যবহার করি। আমাদের সিস্টেমে সংরক্ষিত সকল পাসওয়ার্ড হ্যাশড ফর্মে থাকে।",
    },
    {
      title: "কুকিজ ও ট্র্যাকিং",
      content:
        "আমরা আমাদের সেবা উন্নত করতে কুকিজ এবং বিশ্লেষণ টুল ব্যবহার করি। আপনার ব্রাউজার সেটিংস থেকে যেকোনো সময় কুকিজ নিষ্ক্রিয় করা সম্ভব।",
    },
    {
      title: "আপনার অধিকার",
      content:
        "আপনি যেকোনো সময় আপনার ব্যক্তিগত তথ্য দেখতে, আপডেট করতে বা মুছে ফেলার অনুরোধ করতে পারেন। এই বিষয়ে support@evorisemedia.com এ যোগাযোগ করুন।",
    },
    {
      title: "নীতিমালার পরিবর্তন",
      content:
        "আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। যেকোনো গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আমরা আপনাকে ইমেইলের মাধ্যমে জানাবো।",
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-background overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 bg-primary blur-3xl rounded-full" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground/80 text-sm font-medium mb-8 transition-colors">
            <ArrowLeft size={14} /> হোমে ফিরুন
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center">
              <Shield size={22} className="text-primary" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground/80">আইনি নথি</div>
          </div>
          <h1 className="text-foreground mb-4" style={{ letterSpacing: "-0.03em" }}>
            গোপনীয়তা নীতি
          </h1>
          <p className="text-foreground/80 text-base font-medium">
            সর্বশেষ আপডেট: জানুয়ারি ২০২৫
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-surface relative border-t border-border">
        <div className="absolute inset-0 bg-size-[40px_40px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-surface/5 border border-border backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
            {/* Intro */}
            <div className="p-8 md:p-10 border-b border-border">
              <p className="text-foreground/80 leading-relaxed font-medium text-base">
                EvoRise Media-তে আপনার গোপনীয়তা রক্ষা করা আমাদের অন্যতম প্রধান দায়িত্ব। এই নীতিমালায় আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি তা বিস্তারিতভাবে বর্ণনা করা হয়েছে।
              </p>
            </div>

            {/* Sections */}
            <div className="divide-y divide-white/5">
              {sections.map((section, i) => (
                <div key={i} className="p-8 md:p-10">
                  <div className="flex items-start gap-4">
                    <span className="w-7 h-7 rounded-full bg-surface/5 border border-border text-primary flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <h2 className="font-black text-foreground text-lg mb-3" style={{ letterSpacing: "-0.01em" }}>
                        {section.title}
                      </h2>
                      <p className="text-foreground/80 leading-relaxed font-medium text-sm">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="p-8 md:p-10 bg-surface border-t border-border">
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                এই নীতিমালা সম্পর্কে কোনো প্রশ্ন থাকলে{" "}
                <a href="mailto:support@evorisemedia.com" className="text-primary font-bold hover:underline">
                  support@evorisemedia.com
                </a>{" "}
                এ যোগাযোগ করুন।
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Link href="/terms" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/80 hover:text-primary transition-colors">
              <FileText size={14} /> শর্তাবলী দেখুন
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
