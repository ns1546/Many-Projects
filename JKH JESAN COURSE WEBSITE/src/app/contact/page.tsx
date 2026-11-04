"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Mail, Phone, MapPin, Send, MessageSquare,
  Clock, ArrowRight, CheckCircle2, MessageCircle,
  HelpCircle, ExternalLink, Sparkles
} from "lucide-react";

const OFFICIAL_WHATSAPP_NUMBER = "8801607084155";
const OFFICIAL_WHATSAPP_DISPLAY = "01607084155";
const OFFICIAL_EMAIL = "helloevorisesolutions@gmail.com";

const SUBJECT_OPTIONS = [
  "কোর্স ভর্তি ও কারিকুলাম সংক্রান্ত",
  "মিউজিক প্রোডাকশন ও স্টুডিও পরামর্শ",
  "পেমেন্ট ও অ্যাকাউন্ট ভেরিফিকেশন",
  "প্রোজেক্ট ফাইল ও স্টুডিও সফটওয়্যার সহায়তা",
  "অন্যান্য সাধারণ জিজ্ঞাসা",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ waUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }

    setLoading(true);

    // Build professional Bengali WhatsApp message format
    const waMessage = 
`📩 *নতুন যোগাযোগ বার্তা — EvoRise Media*
━━━━━━━━━━━━━━━━━━━━
👤 *নাম:* ${formData.name.trim()}
📞 *ফোন নম্বর:* ${formData.phone.trim()}
✉️ *ইমেইল:* ${formData.email.trim()}
📌 *বিষয়:* ${formData.subject}

💬 *বার্তা:*
${formData.message.trim()}
━━━━━━━━━━━━━━━━━━━━
⏰ *সময়:* ${new Date().toLocaleString("bn-BD")}
🌐 *evorisemedia.com*`;

    const waUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    try {
      // 1. Record inquiry in backend database
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
        }),
      });

      // 2. Open WhatsApp in new tab
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }

      setSubmittedData({ waUrl });
      toast.success("মেসেজ সফলভাবে তৈরি হয়েছে! WhatsApp ওপেন হচ্ছে...");
    } catch (err) {
      console.error(err);
      // Fallback: still open WhatsApp even if DB recording fails
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
      setSubmittedData({ waUrl });
      toast.success("WhatsApp ওপেন হচ্ছে...");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      subject: SUBJECT_OPTIONS[0],
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Compact & Responsive Hero ─────────────────────────── */}
      <section className="relative pt-20 sm:pt-28 pb-8 sm:pb-12 bg-background border-b border-border overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10 bg-primary blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5 bg-primary blur-2xl rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="leading-none">সার্বক্ষণিক সহায়তা ও অফিশিয়াল হেল্পডেস্ক</span>
          </div>

          <h1 className="text-foreground mb-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            আমরা সাহায্য করতে <span className="text-primary">প্রস্তুত</span>
          </h1>

          <p className="text-foreground/75 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            কোর্স ভর্তি, মিউজিক প্রোডাকশন পরামর্শ কিংবা টেকনিক্যাল সমস্যা—নিচের ফর্মে বিস্তারিত লিখুন, এক ক্লিকেই আমাদের অফিশিয়াল WhatsApp-এ মেসেজ পৌঁছে যাবে।
          </p>
        </div>
      </section>

      {/* ── 3 Direct Contact Cards ───────────────────────────── */}
      <section className="bg-background py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">

            {/* 1. WhatsApp Helpline */}
            <div className="bg-surface border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-emerald-500 transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600">
                <MessageCircle size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-600">
                    WhatsApp সাপোর্ট
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700">
                    দ্রুততম
                  </span>
                </div>
                <a
                  href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=Hello%20EvoRise%20Media%2C%20I%20need%20support`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground text-sm hover:text-emerald-600 transition-colors block truncate"
                >
                  +{OFFICIAL_WHATSAPP_NUMBER}
                </a>
                <p className="text-xs text-foreground/60 font-medium mt-0.5">
                  সরাসরি চ্যাট করতে ক্লিক করুন
                </p>
              </div>
            </div>

            {/* 2. Official Email */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary/50 transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                <Mail size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-primary mb-0.5">
                  অফিশিয়াল ইমেইল
                </p>
                <a
                  href={`mailto:${OFFICIAL_EMAIL}`}
                  className="font-bold text-foreground text-sm hover:text-primary transition-colors block truncate"
                >
                  {OFFICIAL_EMAIL}
                </a>
                <p className="text-xs text-foreground/60 font-medium mt-0.5">
                  ২৪ ঘণ্টার মধ্যে রিপ্লাই দেওয়া হয়
                </p>
              </div>
            </div>

            {/* 3. Studio Location */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary/50 transition-all flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600">
                <MapPin size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                  স্টুডিও একাডেমি
                </p>
                <p className="font-bold text-foreground text-sm truncate">
                  House 127, Road 10, Niketon
                </p>
                <p className="text-xs text-foreground/60 font-medium mt-0.5">
                  Gulshan 1, Dhaka 1212
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Main Interactive Contact & WhatsApp Form Section ──── */}
      <section id="message-form" className="py-8 sm:py-14 bg-surface/50 relative border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 sm:gap-10 items-start">

            {/* Left: Professional Form */}
            <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      যোগাযোগ ফর্ম — সরাসরি WhatsApp-এ বার্তা পাঠান
                    </h2>
                    <p className="text-xs text-foreground/70 font-medium">
                      তথ্যগুলো পূরণ করে সেন্ড চাপলে স্বয়ংক্রিয়ভাবে সাজানো ফরম্যাটে আমাদের WhatsApp-এ যাবে।
                    </p>
                  </div>
                </div>

                {submittedData ? (
                  /* ── Success Screen ── */
                  <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                      <CheckCircle2 size={34} />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2">
                      বার্তা সফলভাবে তৈরি হয়েছে!
                    </h3>
                    <p className="text-foreground/75 text-sm font-medium max-w-md mb-6 leading-relaxed">
                      আপনার বার্তাটি ডাটাবেজে সংরক্ষিত হয়েছে এবং আমাদের অফিশিয়াল WhatsApp নম্বরে (<strong>+{OFFICIAL_WHATSAPP_NUMBER}</strong>) পাঠানোর জন্য প্রস্তুত।
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                      <a
                        href={submittedData.waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm py-3 px-6 flex items-center justify-center gap-2 flex-1"
                      >
                        <MessageCircle size={16} />
                        <span>WhatsApp-এ চ্যাট খুলুন</span>
                        <ExternalLink size={13} />
                      </a>
                      <button
                        onClick={handleReset}
                        className="btn-outline text-sm py-3 px-5 flex-1"
                      >
                        আরেকটি বার্তা পাঠান
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Interactive Form ── */
                  <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                    
                    {/* Name & Phone in 2 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-bold text-foreground/80 mb-1.5">
                          আপনার পুরো নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="উদাঃ রাফি আহমেদ"
                          className="w-full h-11 px-3.5 border border-border rounded-xl text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-phone" className="block text-xs font-bold text-foreground/80 mb-1.5">
                          ফোন / WhatsApp নম্বর <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="উদাঃ 01700000000 বা 01607084155"
                          className="w-full h-11 px-3.5 border border-border rounded-xl text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email & Subject in 2 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-bold text-foreground/80 mb-1.5">
                          ইমেইল এড্রেস <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="yourname@gmail.com"
                          className="w-full h-11 px-3.5 border border-border rounded-xl text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-subject" className="block text-xs font-bold text-foreground/80 mb-1.5">
                          যোগাযোগের বিষয় <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="contact-subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-11 px-3 border border-border rounded-xl text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors cursor-pointer"
                        >
                          {SUBJECT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message Area */}
                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-bold text-foreground/80 mb-1.5">
                        আপনার বার্তা / প্রশ্ন <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="আপনার প্রশ্ন বা প্রয়োজনীয় বার্তা এখানে বিস্তারিত লিখুন..."
                        className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors resize-none"
                      />
                    </div>

                    {/* WhatsApp Format Note */}
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2.5">
                      <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/75 leading-relaxed font-medium">
                        বাটনে ক্লিক করার সাথে সাথে আপনার মেসেজটি প্রফেশনাল ফরম্যাটে কনভার্ট হয়ে সরাসরি আমাদের অফিশিয়াল WhatsApp (<strong>{OFFICIAL_WHATSAPP_DISPLAY}</strong>)-এ ওপেন হবে।
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-primary text-black font-black text-sm rounded-xl hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>মেসেজ তৈরি হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>মেসেজ পাঠান ও WhatsApp-এ যুক্ত হন</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Quick Connect & Response Time Widget */}
            <div className="space-y-4 sm:space-y-5">

              {/* Direct WhatsApp Box */}
              <div className="bg-surface border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">তাত্ক্ষণিক WhatsApp হেল্পলাইন</h3>
                    <p className="text-xs text-emerald-700 font-bold">অনলাইন চ্যাট চালু আছে</p>
                  </div>
                </div>

                <p className="text-xs text-foreground/70 font-medium leading-relaxed mb-4">
                  কোনো ফর্ম পূরণ করতে না চাইলে সরাসরি নিচে ক্লিক করে আমাদের টিমের সাথে এক ক্লিকে চ্যাট শুরু করুন।
                </p>

                <a
                  href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=Hello%20EvoRise%20Media%2C%20I%20have%20an%20inquiry`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>সরাসরি WhatsApp চ্যাট শুরু করুন</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Response Time Guarantee */}
              <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                    <Clock size={16} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">রিপ্লাই টাইম ও সাপোর্ট সময়</h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                    <span className="text-foreground/75 font-medium">WhatsApp রেসপন্স</span>
                    <span className="font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      ১৫ - ৩০ মিনিট
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                    <span className="text-foreground/75 font-medium">ইমেইল রিপ্লাই</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      ২৪ ঘণ্টার মধ্যে
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-foreground/75 font-medium">স্টুডিও ওপেন</span>
                    <span className="font-semibold text-foreground/80">
                      শনিবার - বৃহস্পতিবার (১০টা - ৮টা)
                    </span>
                  </div>
                </div>
              </div>

              {/* FAQ Quick Link */}
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-xs">সাধারণ প্রশ্ন আছে?</h4>
                    <p className="text-[11px] text-foreground/60 font-medium">কোর্স সংক্রান্ত সব উত্তর FAQ পেজে রয়েছে</p>
                  </div>
                </div>
                <a
                  href="/faq"
                  className="inline-flex items-center gap-1 text-primary font-bold text-xs hover:underline shrink-0"
                >
                  <span>FAQ</span>
                  <ArrowRight size={13} />
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
