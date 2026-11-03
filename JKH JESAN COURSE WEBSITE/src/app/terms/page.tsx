import Link from "next/link";
import { Scale, Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "শর্তাবলী | EvoRise Media",
  description: "EvoRise Media ব্যবহারের শর্তাবলী ও নিয়মনীতি।",
};

export default function TermsPage() {
  const sections = [
    {
      num: "০১",
      title: "সাধারণ শর্তাবলী",
      content:
        "EvoRise Media প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি আমাদের শর্তাবলীর সাথে সম্মত হচ্ছেন। আপনি যদি আমাদের শর্তাবলীর কোনো অংশের সাথে দ্বিমত পোষণ করেন, তবে আপনি আমাদের সার্ভিস ব্যবহার থেকে বিরত থাকতে পারেন।",
    },
    {
      num: "০২",
      title: "কোর্স অ্যাক্সেস এবং ব্যবহার",
      content:
        "আপনি একবার কোর্স ক্রয় করলে, আপনি আজীবন কোর্সটির অ্যাক্সেস পাবেন। তবে, আপনি কোনোভাবেই কোর্সের ভিডিও বা উপাদান ডাউনলোড, রেকর্ড, বিক্রি বা অন্য কারো সাথে শেয়ার করতে পারবেন না। এই শর্ত লঙ্ঘনে আইনি ব্যবস্থা নেওয়া হতে পারে।",
    },
    {
      num: "০৩",
      title: "পেমেন্ট ও কোর্স পলিসি",
      content:
        "ডিজিটাল কনটেন্ট ও সমস্ত লেসনে তাৎক্ষণিক আজীবন অ্যাক্সেস সক্রিয় হওয়ার কারণে কোর্স ক্রয়ের পর কোনো মূল্য ফেরতযোগ্য নয়। তবে কারিগরি ত্রুটির কারণে অসাবধানতাবশত একই কোর্সের জন্য ডাবল পেমেন্ট কেটে নেওয়া হয়ে থাকলে ট্রানজেকশন আইডি যাচাই সাপেক্ষে অতিরিক্ত অর্থ সম্পূর্ণ রিফান্ড প্রদান করা হয়।",
    },
    {
      num: "০৪",
      title: "একাউন্ট বাতিলকরণ",
      content:
        "যদি আমরা প্রমাণ পাই যে আপনি আমাদের শর্তাবলী ভঙ্গ করেছেন (যেমন: ভিডিও পাইরেসি, একাউন্ট শেয়ারিং), তবে আমরা কোনো পূর্ব নোটিশ ছাড়াই আপনার একাউন্ট স্থায়ীভাবে বাতিল করার অধিকার রাখি।",
    },
    {
      num: "০৫",
      title: "মেধাস্বত্ব",
      content:
        "প্ল্যাটফর্মে প্রকাশিত সমস্ত কন্টেন্ট — ভিডিও, টেক্সট, ছবি — EvoRise Media-এর মেধাস্বত্বের আওতায় সংরক্ষিত। লিখিত অনুমতি ছাড়া যেকোনো কন্টেন্টের পুনর্ব্যবহার নিষিদ্ধ।",
    },
    {
      num: "০৬",
      title: "শর্তাবলীর পরিবর্তন",
      content:
        "আমরা যেকোনো সময় এই শর্তাবলী আপডেট করতে পারি। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে ইমেইলে জানানো হবে। প্ল্যাটফর্ম ব্যবহার অব্যাহত রাখলে নতুন শর্তাবলী স্বীকৃতি বলে গণ্য হবে।",
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-background overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 bg-surface blur-3xl rounded-full" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground/80 text-sm font-medium mb-8 transition-colors">
            <ArrowLeft size={14} /> হোমে ফিরুন
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-surface/10 border border-border rounded-2xl flex items-center justify-center">
              <Scale size={22} className="text-foreground/80" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground/80">আইনি নথি</div>
          </div>
          <h1 className="text-foreground mb-4" style={{ letterSpacing: "-0.03em" }}>
            শর্তাবলী
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
            <div className="p-8 md:p-10 border-b border-border bg-surface">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-primary mt-1 shrink-0" />
                <p className="text-foreground/80 leading-relaxed font-medium text-sm">
                  এই শর্তাবলী EvoRise Media-এর সকল সেবা ব্যবহারের ক্ষেত্রে প্রযোজ্য। প্ল্যাটফর্ম ব্যবহারের আগে সম্পূর্ণ শর্তাবলী পড়ুন।
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="divide-y divide-white/5">
              {sections.map((section, i) => (
                <div key={i} className="p-8 md:p-10 hover:bg-surface/5 transition-colors">
                  <div className="flex items-start gap-5">
                    <span className="text-2xl font-black text-foreground/80 shrink-0 leading-none pt-0.5">
                      {section.num}
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

            {/* Footer */}
            <div className="p-8 md:p-10 bg-surface border-t border-border">
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                এই শর্তাবলী সম্পর্কে প্রশ্ন থাকলে{" "}
                <a href="mailto:support@evorisemedia.com" className="text-primary font-bold hover:underline">
                  support@evorisemedia.com
                </a>{" "}
                এ যোগাযোগ করুন।
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/privacy" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/80 hover:text-primary transition-colors">
              <Shield size={14} /> গোপনীয়তা নীতি দেখুন
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
