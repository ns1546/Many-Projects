"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IconMail, IconPhone, IconMapPin, IconArrowUpRight, 
  IconBrandFacebook, IconBrandYoutube, IconBrandInstagram, IconBrandWhatsapp 
} from "@tabler/icons-react";
import { Logo } from "./Logo";

export function Footer() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/reset-password");
  if (pathname.startsWith("/learn") || pathname.startsWith("/admin") || isAuthPage) return null;

  const year = new Date().getFullYear();

  const platformLinks = [
    { label: "সব কোর্সসমূহ",     href: "/courses" },
    { label: "আমাদের সম্পর্কে",   href: "/about" },
    { label: "সচরাচর জিজ্ঞাসা", href: "/#faq" },
    { label: "যোগাযোগ হেল্পডেস্ক", href: "/contact" },
  ];

  const categoryLinks = [
    { label: "মিউজিক প্রোডাকশন",   href: "/courses" },
    { label: "মিক্সিং ও মাস্টারিং", href: "/courses" },
    { label: "ভোকাল প্রসেসিং",     href: "/courses" },
    { label: "সাউন্ড ডিজাইন",       href: "/courses" },
  ];

  const socials = [
    { href: "https://www.facebook.com/EvoRiseMedia",  label: "Facebook",  Icon: IconBrandFacebook },
    { href: "https://youtube.com/@evorisemarketingagency?si=hnaFk7EdXswma_8N",  label: "YouTube",   Icon: IconBrandYoutube },
    { href: "https://www.instagram.com/evorise.solutions?mdxt=MTEya2I0b2l3cHM=", label: "Instagram", Icon: IconBrandInstagram },
  ];

  return (
    <footer className="w-full bg-surface border-t border-border select-none">
      
      {/* ── Main Footer Grid: Fully Responsive on all Mobile & Desktop screens ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">

          {/* 1. Brand Column (Col 1-5 on desktop) */}
          <div className="lg:col-span-5 space-y-3.5">
            <Link href="/" aria-label="EvoRise Media Home" className="inline-block">
              <Logo size="md" />
            </Link>

            {/* Sister Concern Badge */}
            <div>
              <div 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                style={{ 
                  background: "rgba(200, 144, 10, 0.10)", 
                  border: "1px solid rgba(200, 144, 10, 0.22)", 
                  color: "var(--gold)" 
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>EvoRise Solutions-এর অঙ্গপ্রতিষ্ঠান</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-foreground/75 font-medium max-w-sm">
              EvoRise Media — বাংলাদেশের প্রিমিয়াম অডিও ও মিউজিক একাডেমি। চিফ মেন্টর JKH Jesan-এর সাথে ইন্ডাস্ট্রিয়াল স্ট্যান্ডার্ড সাউন্ড ডিজাইন, মিক্সিং ও মাস্টারিং শিখুন।
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {socials.map(({ href, label, Icon }) => (
                <a 
                  key={label} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={label}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-background border border-border text-foreground/70 hover:bg-primary hover:text-black hover:border-primary transition-all duration-200 shadow-xs"
                >
                  <Icon size={15} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* 2, 3 & 4. Navigation & Contact: All 3 Sections in Exactly 1 Line on Mobile (per user instruction) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-7 footer-nav-grid grid grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
            
            {/* Column 1: Platform Links */}
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary truncate">
                প্ল্যাটফর্ম
              </h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {platformLinks.map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className="text-[11px] sm:text-sm font-semibold text-foreground/75 hover:text-primary transition-colors inline-block leading-tight"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Category Links */}
            <div className="space-y-2.5 sm:space-y-3">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary truncate">
                কোর্স ক্যাটাগরি
              </h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {categoryLinks.map((cat) => (
                  <li key={cat.label}>
                    <Link 
                      href={cat.href}
                      className="text-[11px] sm:text-sm font-semibold text-foreground/75 hover:text-primary transition-colors inline-block leading-tight"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Details (Same 1 Single Row on Mobile) */}
            <div className="space-y-2.5 sm:space-y-3 footer-contact-box">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary truncate">
                যোগাযোগ ও সহায়তা
              </h3>
              <ul className="space-y-2 sm:space-y-2.5">
                <li className="flex items-start gap-1.5 sm:gap-2.5 text-[11px] sm:text-sm font-medium text-foreground/80">
                  <IconMail size={14} strokeWidth={2} className="text-primary mt-0.5 shrink-0" />
                  <a href="mailto:helloevorisesolutions@gmail.com" className="hover:text-primary transition-colors break-all leading-tight">
                    <span className="sm:hidden font-bold">ইমেইল</span>
                    <span className="hidden sm:inline">helloevorisesolutions@gmail.com</span>
                  </a>
                </li>
                <li className="flex items-start gap-1.5 sm:gap-2.5 text-[11px] sm:text-sm font-medium text-foreground/80">
                  <IconPhone size={14} strokeWidth={2} className="text-primary mt-0.5 shrink-0" />
                  <a href="tel:01607084155" className="hover:text-primary transition-colors font-bold leading-tight">
                    <span className="sm:hidden">কল করুন</span>
                    <span className="hidden sm:inline">+880 1607 084155</span>
                  </a>
                </li>
                <li className="flex items-start gap-1.5 sm:gap-2.5 text-[11px] sm:text-sm font-medium text-foreground/80">
                  <IconBrandWhatsapp size={14} strokeWidth={2} className="text-[#25D366] mt-0.5 shrink-0" />
                  <a 
                    href="https://wa.me/8801607084155?text=Hello%20EvoRise%20Media%2C%20I%20need%20support" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#25D366] transition-colors font-bold leading-tight"
                  >
                    WhatsApp
                  </a>
                </li>
                <li className="flex items-start gap-1.5 sm:gap-2.5 text-[11px] sm:text-sm font-medium text-foreground/75">
                  <IconMapPin size={14} strokeWidth={2} className="text-primary mt-0.5 shrink-0" />
                  <span className="leading-tight">
                    <span className="sm:hidden">গুলশান ১, ঢাকা</span>
                    <span className="hidden sm:inline">House 127, Road 10, Niketon, Gulshan 1, Dhaka 1212</span>
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* ── Bottom Bar: elevated above mobile bottom navigation bar ── */}
      <div className="border-t border-border bg-background/50">
        <div className="footer-bottom-bar max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:pb-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-foreground/60">
            <span>© {year} EvoRise Media. All rights reserved.</span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span>Chief Mentor: JKH Jesan</span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span className="flex items-center gap-1 font-semibold text-foreground/75">
              Developed by
              <a
                href="https://www.facebook.com/EvoRiseSolutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
              >
                EvoRise Solutions
                <IconArrowUpRight size={11} strokeWidth={2.5} />
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-foreground/60">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span className="opacity-30">•</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>

        </div>
      </div>

    </footer>
  );
}
