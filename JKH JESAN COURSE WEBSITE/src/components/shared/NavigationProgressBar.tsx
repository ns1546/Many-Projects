"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route change completes, finish progress bar and hide
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on internal links to give INSTANT feedback (< 16ms)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore anchor jumps, external links, mailto, tel, downloads
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // If clicking the current page with no hash change, do nothing
      const currentFull = window.location.pathname + window.location.search;
      if (href === currentFull) return;

      // Start loading bar immediately
      setLoading(true);
      setProgress(20);

      // Progressive simulated increment while server renders
      const timer1 = setTimeout(() => setProgress(45), 150);
      const timer2 = setTimeout(() => setProgress(75), 400);
      const timer3 = setTimeout(() => setProgress(90), 800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none select-none"
      role="progressbar"
      aria-label="পৃষ্ঠা লোড হচ্ছে"
    >
      {/* Top golden progress bar with glow */}
      <div
        className="h-[3.5px] bg-gradient-to-r from-amber-500 via-primary to-yellow-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(200,144,10,0.8)]"
        style={{ width: `${progress}%` }}
      />
      {/* Moving pulsing dot at the tip */}
      <div 
        className="absolute top-0 w-8 h-[3.5px] bg-white opacity-80 blur-[2px] transition-all duration-300 ease-out"
        style={{ left: `calc(${progress}% - 2rem)` }}
      />
    </div>
  );
}

