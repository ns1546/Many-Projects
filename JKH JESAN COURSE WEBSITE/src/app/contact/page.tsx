"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Mail, Phone, MapPin, Send, MessageSquare,
  Clock, ArrowRight, CheckCircle2
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSent(true);
        toast.success("মেসেজ সফলভাবে পাঠানো হয়েছে!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        const data = await res.json();
        toast.error(data.message || "মেসেজ পাঠাতে সমস্যা হয়েছে।");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি! কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 bg-background overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 bg-primary blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-8 bg-surface blur-3xl rounded-full" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2.5 bg-primary/10 border border-primary/25 px-4 py-2 rounded-full text-xs font-bold text-primary mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="leading-none">আমাদের সাথে যোগাযোগ করুন</span>
          </div>
          <h1 className="text-foreground mb-5" style={{ letterSpacing: "-0.03em" }}>
            আমরা সাহায্য করতে{" "}
            <span className="text-primary">প্রস্তুত</span>
          </h1>
          <p className="text-foreground/80 text-lg max-w-xl mx-auto leading-relaxed">
            যেকোনো প্রশ্ন বা সমস্যায় নিচের ফর্মে মেসেজ দিন — আমরা ২৪ ঘণ্টার মধ্যে জানাবো।
          </p>
        </div>
      </section>

      {/* ── Info Cards ───────────────────────────────────────── */}
      <section className="bg-background pb-0 pt-0 sm:pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 sm:-mb-8 mb-4 relative z-10">
            {[
              {
                icon: Mail,
                title: "ইমেইল",
                value: "support@evorisemedia.com",
                href: "mailto:support@evorisemedia.com",
                sub: "সাধারণত ২৪ ঘণ্টার মধ্যে রিপ্লাই",
              },
              {
                icon: Phone,
                title: "WhatsApp সাপোর্ট",
                value: "সরাসরি চ্যাট শুরু করুন",
                href: "https://wa.me/8801754220135?text=Hello%20EvoRise%20Media%2C%20I%20need%20support",
                sub: "২৪/৭ অনলাইন চ্যাট হেল্পডেস্ক",
              },
              {
                icon: MapPin,
                title: "ঠিকানা",
                value: "মিরপুর, ঢাকা",
                href: "https://maps.google.com",
                sub: "বাংলাদেশ",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-row sm:flex-col items-center sm:items-start gap-3.5 sm:gap-0"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center sm:mb-4 shrink-0">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-primary mb-0.5">
                    {item.title}
                  </p>
                  <a
                    href={item.href}
                    className="font-bold text-foreground text-sm hover:text-primary transition-colors block truncate"
                  >
                    {item.value}
                  </a>
                  <p className="text-xs text-foreground/60 font-medium mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form Section ─────────────────────────────────────── */}
      <section id="message-form" className="py-10 sm:py-24 bg-surface relative border-t border-border">
        <div className="absolute inset-0 bg-size-[40px_40px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 sm:gap-12 items-start">

            {/* Form */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-5 sm:p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-surface/5 border border-border flex items-center justify-center">
                    <MessageSquare size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">মেসেজ পাঠান</h2>
                    <p className="text-xs text-foreground/80 font-medium">সব ফিল্ড পূরণ করুন</p>
                  </div>
                </div>

                {sent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-surface/5 border border-border rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-2">মেসেজ পাঠানো হয়েছে!</h3>
                    <p className="text-foreground/80 text-sm font-medium max-w-xs">
                      ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-6 text-sm font-bold text-primary hover:underline"
                    >
                      আরেকটি মেসেজ পাঠান
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-bold text-foreground/80 mb-2">
                        আপনার নাম
                      </label>
                      <input
                        id="contact-name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="আপনার পুরো নাম লিখুন"
                        className="w-full h-12 px-4 border border-border rounded-xl text-sm font-medium text-foreground placeholder-white/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors shadow-inner"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-bold text-foreground/80 mb-2">
                        ইমেইল এড্রেস
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@example.com"
                        className="w-full h-12 px-4 border border-border rounded-xl text-sm font-medium text-foreground placeholder-white/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors shadow-inner"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-bold text-foreground/80 mb-2">
                        আপনার মেসেজ
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="আপনার প্রশ্ন বা বার্তা এখানে লিখুন..."
                        className="w-full px-4 py-3 border border-border rounded-xl text-sm font-medium text-foreground placeholder-white/30 bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors resize-none shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          পাঠানো হচ্ছে...
                        </>
                      ) : (
                        <>
                          মেসেজ পাঠান <Send size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              {/* Response time */}
              <div className="bg-surface/5 border border-border backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-surface/5 border border-border rounded-xl flex items-center justify-center">
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <h3 className="font-black text-foreground text-sm">রিপ্লাই টাইম</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "ইমেইল", time: "২৪ ঘণ্টার মধ্যে" },
                    { label: "WhatsApp", time: "৩–৬ ঘণ্টার মধ্যে" },
                    { label: "ফেসবুক", time: "কয়েক ঘণ্টার মধ্যে" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center text-sm">
                      <span className="text-foreground/80 font-medium">{item.label}</span>
                      <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full text-xs">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="bg-surface rounded-2xl p-6">
                <h3 className="font-black text-foreground text-sm mb-4">সোশ্যাল মিডিয়া</h3>
                <div className="space-y-3">
                  {[
                    { name: "Facebook", handle: "jkhjesan", href: "https://facebook.com/jkhjesan", color: "text-blue-400" },
                    { name: "YouTube", handle: "@jkhjesan", href: "https://youtube.com/@jkhjesan", color: "text-red-400" },
                    { name: "Instagram", handle: "@jkhjesan", href: "https://instagram.com/jkhjesan", color: "text-pink-400" },
                  ].map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-surface/5 border border-border rounded-xl hover:bg-surface/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm ${s.color}`}>{s.name}</span>
                        <span className="text-foreground/80 text-xs font-medium">{s.handle}</span>
                      </div>
                      <ArrowRight size={14} className="text-foreground/80 group-hover:text-foreground/80 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ CTA */}
              <div className="bg-surface/5 border border-border backdrop-blur-sm rounded-2xl p-6">
                <h3 className="font-black text-foreground text-sm mb-2">সাধারণ প্রশ্ন?</h3>
                <p className="text-foreground/80 text-xs font-medium mb-4 leading-relaxed">
                  FAQ পেজে আপনার অনেক প্রশ্নের উত্তর আগেই দেওয়া আছে।
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-dark transition-colors"
                >
                  FAQ দেখুন <ArrowRight size={14} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
