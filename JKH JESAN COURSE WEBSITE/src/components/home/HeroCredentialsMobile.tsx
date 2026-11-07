"use client";

import { useState } from "react";
import { ChevronDown, Mic, Headphones, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function HeroCredentialsMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden pt-2">
      {/* 1 Single Clean Row Header Pill (Guaranteed Single Line on Mobile) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all active:scale-[0.99] shadow-2xs"
        style={{
          background: "var(--cream-300)",
          borderColor: "var(--border-strong)",
          color: "var(--ink-900)",
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
          <div className="text-xs font-bold truncate">
            <span className="text-foreground/75">🎙️ Mentor:</span>{" "}
            <strong className="text-primary font-black">JKH Jesan</strong>
            <span className="text-foreground/60 mx-1.5">•</span>
            <span className="text-foreground/80 font-semibold">EvoRise Media</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-black text-primary shrink-0 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
          <span>{isOpen ? "বন্ধ করুন" : "বিস্তারিত"}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {/* Accordion Content (Reveals Full Credentials on Click) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mt-1.5"
          >
            <div
              className="p-3 rounded-xl border space-y-2 shadow-xs text-xs"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                  <Mic size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-foreground/60 tracking-wider block">চিফ মেন্টর</span>
                  <p className="font-black text-foreground text-xs truncate">JKH Jesan</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1 border-t border-border/60">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-600 shrink-0">
                  <Headphones size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-foreground/60 tracking-wider block">অনলাইন পার্টনার</span>
                  <p className="font-bold text-foreground text-xs truncate">EvoRise Solutions</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1 border-t border-border/60">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-600 shrink-0">
                  <GraduationCap size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-foreground/60 tracking-wider block">প্রেজেন্টেড বাই</span>
                  <p className="font-bold text-foreground text-xs truncate">EvoRise Media</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

