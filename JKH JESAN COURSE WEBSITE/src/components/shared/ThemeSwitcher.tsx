"use client";

import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { id: "default", name: "Mossy Hollow (Default)", color: "#0a0e08", textColor: "#ffffff" },
  { id: "marina", name: "Marina", color: "#FFF1E7", textColor: "#326080" },
  { id: "midnight", name: "Midnight Neon", color: "#05050A", textColor: "#00f0ff" },
  { id: "brutalist", name: "Brutalist", color: "#e5e5e5", textColor: "#ff3300" },
  { id: "sunset", name: "Sunset", color: "#14090A", textColor: "#ff9d00" },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("app-theme") || "default";
    setCurrentTheme(savedTheme);
    if (savedTheme !== "default") {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const changeTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem("app-theme", themeId);
    if (themeId === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeId);
    }
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 md:bottom-6">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 flex w-56 flex-col gap-1 rounded-xl border border-border bg-surface p-2 shadow-2xl backdrop-blur-md">
          <p className="mb-2 px-2 pt-1 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Color Grading
          </p>
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={cn(
                "group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-surface-raised",
                currentTheme === theme.id ? "bg-surface-raised text-foreground" : "text-foreground-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-border-strong shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: theme.color }}
                >
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.textColor }} />
                </div>
                {theme.name}
              </div>
              {currentTheme === theme.id && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-xl active:scale-95"
        title="Change Color Grading"
      >
        <Palette className="h-5 w-5" />
      </button>
    </div>
  );
}
