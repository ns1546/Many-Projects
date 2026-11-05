"use client";

import { useEffect, useState, useRef } from "react";
import { IconUsers, IconBook, IconStar, IconBolt } from "@tabler/icons-react";

interface StatItem {
  numericValue: number;
  suffix: string;
  isDecimal?: boolean;
  label: string;
  Icon: any;
}

export default function AnimatedStatsCounter({
  stats
}: {
  stats: { students: number; courses: number; lessons: number; rating: number }
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const items: StatItem[] = [
    {
      numericValue: stats.students || 150,
      suffix: "+",
      label: "সক্রিয় শিক্ষার্থী",
      Icon: IconUsers,
    },
    {
      numericValue: 13,
      suffix: "+ বছর",
      label: "ইন্ডাস্ট্রি অভিজ্ঞতা",
      Icon: IconBolt,
    },
    {
      numericValue: stats.rating || 4.9,
      suffix: "/৫",
      isDecimal: true,
      label: "গড় রেটিং (১১০+ রিভিউ)",
      Icon: IconStar,
    },
    {
      numericValue: stats.lessons || 45,
      suffix: "+",
      label: "হ্যান্ডস-অন লেসন",
      Icon: IconBook,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 md:divide-x"
      style={{ borderColor: "rgba(242, 237, 228, 0.08)" }}
    >
      {items.map((item, i) => (
        <StatCounterCard key={i} item={item} isVisible={isVisible} />
      ))}
    </div>
  );
}

function StatCounterCard({ item, isVisible }: { item: StatItem; isVisible: boolean }) {
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = item.numericValue;
    const duration = 1800;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const val = start + (end - start) * easeOut;

      if (frame >= totalFrames) {
        setCurrentVal(end);
        clearInterval(timer);
      } else {
        setCurrentVal(val);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [isVisible, item.numericValue]);

  const displayValue = item.isDecimal
    ? currentVal.toFixed(1)
    : Math.floor(currentVal);

  const { Icon, suffix, label } = item;

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-0 rounded-xl sm:rounded-none bg-white/[0.03] sm:bg-transparent border border-white/[0.06] sm:border-0 pl-3 md:pl-8 first:pl-0">
      <div
        className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110"
        style={{
          background: "rgba(200, 144, 10, 0.15)",
          border: "1px solid rgba(200, 144, 10, 0.30)",
        }}
      >
        <Icon size={18} strokeWidth={2} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p
          className="font-black text-xl sm:text-2xl leading-none mb-1 truncate transition-all"
          style={{ color: "var(--cream-100)", letterSpacing: "-0.03em" }}
        >
          {displayValue}
          <span className="text-primary text-base sm:text-lg font-bold ml-0.5">{suffix}</span>
        </p>
        <p
          className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate"
          style={{ color: "rgba(242, 237, 228, 0.65)" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

