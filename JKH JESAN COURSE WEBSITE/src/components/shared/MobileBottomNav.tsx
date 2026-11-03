"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconCompass, IconPlayerPlay, IconUser } from "@tabler/icons-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "হোম",      href: "/",          Icon: IconHome },
    { name: "কোর্স",    href: "/courses",   Icon: IconCompass },
    { name: "লার্ন",    href: "/dashboard", Icon: IconPlayerPlay },
    { name: "প্রোফাইল", href: "/profile",   Icon: IconUser },
  ];

  const isCourseDetailPage = pathname.startsWith("/courses/") && pathname !== "/courses";
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/reset-password");
  if (pathname.startsWith("/learn") || pathname.startsWith("/admin") || pathname.startsWith("/checkout") || isCourseDetailPage || isAuthPage) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 w-full z-50 px-3 pt-1.5 pointer-events-none"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div
        className="mobile-nav rounded-2xl overflow-hidden pointer-events-auto"
        style={{ boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ name, href, Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={name}
                href={href}
                className="relative flex flex-col items-center justify-center w-full h-full gap-1"
                style={{ color: isActive ? "var(--primary)" : "var(--foreground-muted)" }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-b-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}

                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.75}
                  className="transition-transform duration-200"
                  style={{ transform: isActive ? "translateY(-1px)" : "none" }}
                />

                <span
                  className="text-[9.5px] font-bold tracking-wide transition-all duration-200"
                  style={{ letterSpacing: "0.02em" }}
                >
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
