"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, Sparkles } from "lucide-react";

interface WhatYouWillLearnProps {
  items: string[];
}

export default function WhatYouWillLearn({ items }: WhatYouWillLearnProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // When folded, show the first 2 items (exactly 1 row of 2 options)
  // When expanded, show all items (in rows of 2 options)
  const visibleItems = isExpanded ? items : items.slice(0, 2);

  return (
    <div className="border border-border bg-surface/60 rounded-2xl p-4 sm:p-6 shadow-xs transition-all">
      {/* Header with Title and Toggle Button */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none gap-2 pb-3 border-b border-border/70"
        onClick={() => setIsExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black tracking-tight text-accent">
              কোর্সটি থেকে কী কী শিখবেন?
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold text-foreground/60">
              মোট {items.length}টি প্রফেশনাল স্কিল ও টেকনিক
            </p>
          </div>
        </div>

        {/* Clickable Fold/Unfold Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-all shrink-0 active:scale-95 shadow-xs"
        >
          <span>{isExpanded ? "সংক্ষেপ করুন" : "সবগুলো দেখুন"}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* 2 Options in One Row Grid — Animated Reveal */}
      <div className="pt-3.5">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {items.slice(0, 2).map((item, i) => (
            <div
              key={`preview-${i}`}
              className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-surface border border-border/80 shadow-xs hover:border-primary/40 transition-colors"
            >
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span className="text-[11px] sm:text-xs font-bold leading-snug text-foreground line-clamp-2">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Folded Items revealed with Framer Motion Animation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3">
                {items.slice(2).map((item, i) => (
                  <motion.div
                    key={`extra-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-surface border border-border/80 shadow-xs hover:border-primary/40 transition-colors"
                  >
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-[11px] sm:text-xs font-bold leading-snug text-foreground line-clamp-2">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

