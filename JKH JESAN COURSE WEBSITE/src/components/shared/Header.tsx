"use client";

import "@/lib/polyfill";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  IconMenu2, IconX, IconLayoutDashboard, IconSettings,
  IconLogout, IconShieldCheck, IconChevronDown, IconBook,
  IconArrowUpRight
} from "@tabler/icons-react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/reset-password");
  if (pathname.startsWith("/learn") || pathname.startsWith("/admin") || isAuthPage) return null;

  const navLinks = [
    { label: "হোম",      href: "/" },
    { label: "কোর্সসমূহ", href: "/courses" },
    { label: "সম্পর্কে", href: "/about" },
    { label: "যোগাযোগ", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;
  const initials = (name: string | null | undefined) => (name || "U")[0].toUpperCase();

  return (
    <>
      {/* ── Desktop Header ────────────────────────────────────── */}
      {/* ── Dedicated Mobile Header (Solid/frosted edge-to-edge app bar) ── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 z-50 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 shadow-xs">
        <Link href="/" aria-label="EvoRise Media home" className="shrink-0">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-xs"
              aria-label="Dashboard"
            >
              {initials(session.user?.name)}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-foreground/80 hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border"
            >
              লগইন
            </Link>
          )}
          <button
            className="p-1.5 rounded-xl text-foreground hover:bg-foreground/8 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <IconX size={20} strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <IconMenu2 size={20} strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── Desktop Header ────────────────────────────────────── */}
      <header
        className="hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ paddingTop: scrolled ? "0.5rem" : "1rem", paddingBottom: scrolled ? "0.5rem" : "1rem" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className={`flex items-center justify-between h-14 px-4 sm:px-6 rounded-full transition-all duration-500 ${
              scrolled
                ? "nav-island shadow-md"
                : "bg-transparent"
            }`}
          >
            {/* Logo */}
            <Link href="/" aria-label="EvoRise Media home" className="shrink-0">
              <Logo size="md" />
            </Link>

            {/* Desktop nav — centered pill links */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/6"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth — desktop */}
            <div className="flex items-center gap-2.5">
              {session ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full hover:bg-foreground/6 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                      {initials(session.user?.name)}
                    </div>
                    <span className="text-sm font-semibold text-foreground/80 max-w-28 truncate hidden lg:block">
                      {session.user?.name}
                    </span>
                    <IconChevronDown
                      size={14}
                      className={`text-foreground/60 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                        className="absolute right-0 top-full mt-3 w-64 bg-surface-raised rounded-2xl shadow-xl border border-border py-1.5 z-50 overflow-hidden"
                        style={{ boxShadow: "var(--shadow-lg), var(--inset-light)" }}
                      >
                        <div className="px-4 py-3.5 border-b border-border flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                            {initials(session.user?.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{session.user?.name}</p>
                            <p className="text-xs text-foreground-muted truncate">{session.user?.email}</p>
                          </div>
                        </div>

                        <div className="py-1.5">
                          {(session.user as any)?.role === "ADMIN" && (
                            <Link href="/admin" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/8 transition-colors">
                              <IconShieldCheck size={16} strokeWidth={1.75} />
                              অ্যাডমিন প্যানেল
                            </Link>
                          )}
                          <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">
                            <IconLayoutDashboard size={16} strokeWidth={1.75} />
                            ড্যাশবোর্ড
                          </Link>
                          <Link href="/dashboard/courses" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">
                            <IconBook size={16} strokeWidth={1.75} />
                            আমার কোর্স
                          </Link>
                          <Link href="/profile" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors">
                            <IconSettings size={16} strokeWidth={1.75} />
                            প্রোফাইল সেটিংস
                          </Link>
                        </div>

                        <div className="border-t border-border py-1.5">
                          <button onClick={() => signOut()}
                            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                            <IconLogout size={16} strokeWidth={1.75} />
                            লগআউট
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login"
                    className="text-sm font-semibold text-foreground/70 hover:text-foreground px-4 py-2.5 transition-colors rounded-full hover:bg-foreground/6">
                    লগইন
                  </Link>
                  <Link href="/register"
                    className="btn-primary text-sm py-2.5 px-5 flex items-center gap-1.5">
                    শুরু করুন
                    <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <IconArrowUpRight size={11} strokeWidth={2.5} />
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Full-Screen Overlay ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 md:hidden bg-background/60 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 38 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[88vw] z-50 md:hidden flex flex-col"
              style={{ background: "var(--surface-raised)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-border">
                <Logo size="sm" />
                <button onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-foreground/70 hover:text-foreground hover:bg-foreground/8 transition-colors">
                  <IconX size={20} strokeWidth={1.75} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto grow">
                {session && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 border border-border"
                    style={{ background: "var(--surface)" }}>
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                      {initials(session.user?.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{session.user?.name}</p>
                      <p className="text-xs text-foreground-muted truncate">{session.user?.email}</p>
                    </div>
                  </div>
                )}

                <nav className="space-y-1 mb-6">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <Link href={link.href}
                        className={`block px-4 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                          isActive(link.href)
                            ? "text-primary bg-primary/10"
                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/6"
                        }`}>
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="border-t border-border pt-4 space-y-1.5">
                  {session ? (
                    <>
                      {(session.user as any)?.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-primary hover:bg-primary/8 transition-colors">
                          <IconShieldCheck size={18} strokeWidth={1.75} /> অ্যাডমিন প্যানেল
                        </Link>
                      )}
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-foreground/80 hover:bg-foreground/6 transition-colors">
                        <IconLayoutDashboard size={18} strokeWidth={1.75} /> ড্যাশবোর্ড
                      </Link>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-foreground/80 hover:bg-foreground/6 transition-colors">
                        <IconSettings size={18} strokeWidth={1.75} /> প্রোফাইল
                      </Link>
                      <button onClick={() => signOut()}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                        <IconLogout size={18} strokeWidth={1.75} /> লগআউট
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login"
                        className="block text-center w-full px-4 py-3.5 rounded-xl font-semibold text-sm text-foreground border border-border hover:bg-foreground/6 transition-colors">
                        লগইন করুন
                      </Link>
                      <Link href="/register"
                        className="block text-center w-full px-4 py-3.5 rounded-xl font-bold text-sm btn-primary">
                        শুরু করুন →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
