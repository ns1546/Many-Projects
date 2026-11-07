"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconHeadphones,
  IconAdjustments,
  IconMicrophone,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react";

interface FeatureItem {
  id: string;
  title: string;
  fullTitle: string;
  desc: string;
  icon: any;
}

const features: FeatureItem[] = [
  {
    id: "daw",
    title: "DAW শিক্ষা",
    fullTitle: "প্রফেশনাল DAW শিক্ষা",
    desc: "FL Studio ও Ableton Live-এ শূন্য থেকে মাস্টার লেভেল পর্যন্ত গভীর দক্ষতা।",
    icon: IconHeadphones,
  },
  {
    id: "mixing",
    title: "মিক্সিং-মাস্টারিং",
    fullTitle: "মিক্সিং ও মাস্টারিং",
    desc: "রেডিও-রেডি ও কমার্শিয়াল সাউন্ডের প্রফেশনাল অ্যানালগ ও ডিজিটাল টেকনিক।",
    icon: IconAdjustments,
  },
  {
    id: "vocal",
    title: "ভোকাল প্রোডাকশন",
    fullTitle: "ভোকাল প্রোডাকশন",
    desc: "রেকর্ডিং, টিউনিং থেকে ফাইনাল ভোকাল মিক্স ও মাস্টারিং প্রসেসিং চেইন।",
    icon: IconMicrophone,
  },
];

export default function InstructorFeaturesMobile() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeFeature = features.find((f) => f.id === activeId);

  return (
    <div className="md:hidden space-y-2">
      {/* 1 Single Row Feature Bar on Mobile */}
      <div
        className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border border-border shadow-xs"
        style={{ background: "var(--surface)" }}
      >
        {features.map((f) => {
          const isSelected = activeId === f.id;
          const IconComp = f.icon;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveId(isSelected ? null : f.id)}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? "bg-primary text-black shadow-xs scale-[0.98]"
                  : "text-foreground/85 hover:bg-surface-raised active:scale-95"
              }`}
              title="ক্লিক করে বিস্তারিত দেখুন"
              aria-expanded={isSelected}
            >
              <IconComp
                size={14}
                strokeWidth={2}
                className={isSelected ? "text-black shrink-0" : "text-primary shrink-0"}
              />
              <span className="truncate text-[11px] font-bold">{f.title}</span>
              <IconChevronDown
                size={12}
                className={`shrink-0 transition-transform duration-200 ${
                  isSelected ? "rotate-180 text-black" : "text-foreground/40"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Expanded Details Card on Click */}
      <AnimatePresence>
        {activeFeature && (
          <motion.div
            key={activeFeature.id}
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="p-3 rounded-xl border border-primary/30 flex items-start justify-between gap-3 shadow-sm"
              style={{ background: "var(--surface-raised)" }}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--gold-100)", border: "1px solid var(--gold-200)" }}
                >
                  <activeFeature.icon size={16} strokeWidth={2} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-foreground mb-0.5 flex items-center gap-1.5">
                    {activeFeature.fullTitle}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-foreground-muted">
                    {activeFeature.desc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-surface transition-colors shrink-0"
                aria-label="Close details"
              >
                <IconX size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

