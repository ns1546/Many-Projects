import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import SignOutButton from "@/components/shared/SignOutButton";
import { Logo } from "@/components/shared/Logo";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  const navItems = [
    { iconName: "LayoutDashboard", label: "ওভারভিউ",               href: "/admin" },
    { iconName: "Users",           label: "ইউজার ম্যানেজমেন্ট",       href: "/admin/users" },
    { iconName: "ShoppingCart",    label: "অর্ডারসমূহ",            href: "/admin/orders" },
    { iconName: "BookOpen",        label: "কোর্স ম্যানেজমেন্ট",       href: "/admin/courses" },
    { iconName: "PlusCircle",      label: "নতুন কোর্স",             href: "/admin/courses/create" },
    { iconName: "ImageIcon",       label: "ব্যানার ও সেকশন ইমেজ",     href: "/admin/banners" },
    { iconName: "ShieldAlert",     label: "সিকিউরিটি ও পাইরেসি",     href: "/admin/security" },
    { iconName: "Target",          label: "পিক্সেল ও মার্কেটিং ট্র্যাকিং", href: "/admin/tracking" },
    { iconName: "Settings",        label: "সিস্টেম ও পেমেন্ট সেটিংস", href: "/admin/settings" },
    { iconName: "Database",        label: "ডাটাবেজ ও ব্যাকআপ",       href: "/admin/backups" },
    { iconName: "Trash2",          label: "রিসাইকেল বিন",           href: "/admin/trash" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-full md:w-64 lg:w-72 flex flex-col shrink-0 border-r border-[#2A3319] bg-[#12160A] text-[#F8F4EC]">

        {/* Logo area */}
        <div className="p-5 border-b border-[#2A3319]">
          <Link href="/admin" aria-label="Admin dashboard">
            <Logo size="md" variant="white" />
          </Link>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 border border-primary/35 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin Panel</span>
          </div>
        </div>

        {/* User badge */}
        <div className="px-4 py-4 border-b border-[#2A3319]">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-full bg-primary text-black border border-primary/40 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
              {(user?.name || "A")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-xs truncate">{user?.name || "EvoRise Admin"}</p>
              <p className="text-[#C8900A] text-[10px] font-semibold tracking-wide">অ্যাডমিনিস্ট্রেটর</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <AdminNav items={navItems} />

        {/* Bottom actions */}
        <div className="p-3 border-t border-[#2A3319] space-y-1">
          <Link 
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#F2EDE4]/80 hover:bg-white/10 hover:text-white transition-all duration-150 group"
          >
            <ExternalLink size={16} className="text-[#A8A296] group-hover:text-primary transition-colors" />
            <span>পাবলিক সাইট দেখুন</span>
          </Link>
          <div className="px-1">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-background">
        <div className="p-6 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
