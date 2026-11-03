"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMail, IconPhone, IconMapPin, IconArrowUpRight, IconBrandFacebook, IconBrandYoutube, IconBrandInstagram, IconBrandWhatsapp } from "@tabler/icons-react";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/reset-password");
  if (pathname.startsWith("/learn") || pathname.startsWith("/admin") || isAuthPage) return null;

  const year = new Date().getFullYear();

  const platformLinks = [
    { label: "সব কোর্স",       href: "/courses" },
    { label: "আমাদের সম্পর্কে", href: "/about" },
    { label: "সার্টিফিকেট যাচাই", href: "/verify" },
    { label: "যোগাযোগ",         href: "/contact" },
    { label: "সাধারণ জিজ্ঞাসা", href: "/faq" },
  ];

  const categoryLinks = [
    { label: "মিউজিক প্রোডাকশন",   href: "/courses" },
    { label: "মিক্সিং ও মাস্টারিং", href: "/courses" },
    { label: "ভোকাল রেকর্ডিং",      href: "/courses" },
    { label: "সাউন্ড ডিজাইন",       href: "/courses" },
  ];

  const socials = [
    { href: "https://facebook.com/jkhjesan",  label: "Facebook",  Icon: IconBrandFacebook },
    { href: "https://youtube.com/@jkhjesan",  label: "YouTube",   Icon: IconBrandYoutube },
    { href: "https://instagram.com/jkhjesan", label: "Instagram", Icon: IconBrandInstagram },
  ];

  return (
    <footer style={{ background: "var(--cream-300)", borderTop: "1px solid var(--border)" }}>

      {/* ── Pre-footer CTA strip ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div
          className="relative rounded-3xl overflow-hidden p-10 md:p-16"
          style={{
            background: "var(--ink-900)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Warm decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, var(--gold) 0%, transparent 70%)", filter: "blur(48px)", top: "-24px" }} />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-5"
                style={{ background: "rgba(200, 144, 10, 0.15)", border: "1px solid rgba(200, 144, 10, 0.30)", borderRadius: "9999px", padding: "0.35rem 1rem" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">এখন এনরোল করুন</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4"
                style={{ color: "var(--cream-100)", letterSpacing: "-0.03em" }}>
                আপনার মিউজিক জার্নি<br />
                <span style={{ color: "var(--gold)" }}>শুরু হোক আজই</span>
              </h2>
              <p className="text-sm font-medium leading-relaxed"
                style={{ color: "rgba(242, 237, 228, 0.65)", maxWidth: "36ch" }}>
                বাংলাদেশের সেরা মিউজিক প্রোডাকশন একাডেমিতে হাজারো শিক্ষার্থীর সাথে যোগ দিন।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <Link href="/courses"
                className="px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-200"
                style={{
                  background: "rgba(242, 237, 228, 0.10)",
                  border: "1.5px solid rgba(242, 237, 228, 0.20)",
                  color: "var(--cream-100)",
                }}>
                কোর্স দেখুন
              </Link>
              <Link href="/register"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold btn-primary">
                ফ্রি রেজিস্ট্রেশন
                <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <IconArrowUpRight size={12} strokeWidth={2.5} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="divider-fancy mb-14" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link href="/" aria-label="EvoRise Media home">
              <Logo size="md" />
            </Link>

            {/* Sister concern badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{ background: "rgba(200, 144, 10, 0.12)", border: "1px solid rgba(200, 144, 10, 0.25)", color: "var(--gold)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>EvoRise Solutions-এর একটি অঙ্গপ্রতিষ্ঠান</span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)", maxWidth: "24ch" }}>
              EvoRise Media — ক্রিয়েটিভ মিডিয়া ও মিউজিক একাডেমি। লিড মেন্টর JKH Jesan-এর সাথে প্রফেশনাল সাউন্ড ডিজাইন ও মিউজিক প্রোডাকশন শিখুন।
            </p>

            <div className="flex gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--foreground-muted)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "var(--primary-foreground)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-raised)"; (e.currentTarget as HTMLElement).style.color = "var(--foreground-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </a>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
              <span className="text-primary text-xs">★★★★★</span>
              <span className="text-xs font-semibold" style={{ color: "var(--foreground-muted)" }}>৪.৯ · ৫০০+ শিক্ষার্থী</span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] mb-6"
              style={{ color: "var(--foreground-muted)" }}>প্ল্যাটফর্ম</h3>
            <ul className="space-y-3.5">
              {platformLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}
                    className="text-sm font-medium transition-all duration-200 hover:text-primary group inline-flex items-center gap-1.5"
                    style={{ color: "var(--foreground-muted)" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] mb-6"
              style={{ color: "var(--foreground-muted)" }}>ক্যাটাগরি</h3>
            <ul className="space-y-3.5">
              {categoryLinks.map((cat) => (
                <li key={cat.label}>
                  <Link href={cat.href}
                    className="text-sm font-medium transition-all duration-200 hover:text-primary"
                    style={{ color: "var(--foreground-muted)" }}>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] mb-6"
              style={{ color: "var(--foreground-muted)" }}>যোগাযোগ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                <IconMail size={15} strokeWidth={1.75} className="text-primary mt-0.5 shrink-0" />
                <a href="mailto:support@evorisemedia.com" className="hover:text-primary transition-colors">support@evorisemedia.com</a>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                <IconPhone size={15} strokeWidth={1.75} className="text-primary mt-0.5 shrink-0" />
                <Link href="/contact" className="hover:text-primary transition-colors">হেল্পলাইন ও সাপোর্ট ডেস্ক</Link>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                <IconBrandWhatsapp size={15} strokeWidth={1.75} className="text-[#25D366] mt-0.5 shrink-0" />
                <a href="https://wa.me/8801754220135?text=Hello%20EvoRise%20Media%2C%20I%20need%20support" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">
                  WhatsApp সাপোর্ট
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                <IconMapPin size={15} strokeWidth={1.75} className="text-primary mt-0.5 shrink-0" />
                <span>মিরপুর, ঢাকা</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-28 sm:pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
              © {year} EvoRise Media. সর্বস্বত্ব সংরক্ষিত। · চিফ মেন্টর: JKH Jesan
            </p>
            <span className="hidden sm:inline text-xs opacity-40">•</span>
            <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--foreground-muted)" }}>
              <span>Developed by</span>
              <a
                href="https://www.facebook.com/EvoRiseSolutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold transition-all inline-flex items-center gap-1 hover:text-primary-dark"
              >
                EvoRise Solutions
                <IconArrowUpRight size={12} strokeWidth={2.5} />
              </a>
            </p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/terms"   className="text-xs font-medium transition-colors hover:text-primary" style={{ color: "var(--foreground-muted)" }}>শর্তাবলী</Link>
            <Link href="/privacy" className="text-xs font-medium transition-colors hover:text-primary" style={{ color: "var(--foreground-muted)" }}>গোপনীয়তা নীতি</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
