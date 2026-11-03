import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { User } from "lucide-react";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Trophy, Settings } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect("/login");
  }

  const navItems = [
    { icon: LayoutDashboard, label: "ড্যাশবোর্ড", href: "/dashboard" },
    { icon: BookOpen, label: "আমার কোর্স", href: "/dashboard/courses" },
    { icon: Trophy, label: "সার্টিফিকেট", href: "/dashboard/certificates" },
    { icon: Settings, label: "প্রোফাইল", href: "/profile", active: true },
  ];

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[260px_1fr] gap-8">

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-surface/5 border border-border backdrop-blur-md rounded-2xl overflow-hidden sticky top-24 shadow-xl">
            {/* Dark user header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-surface/90 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shrink-0 shadow-[0_0_10px_rgba(200,144,10,0.3)]">
                {(user.name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                <p className="text-xs text-foreground/80 font-medium truncate">{user.email}</p>
              </div>
            </div>

            <nav className="p-3 space-y-0.5">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors border border-transparent ${
                    item.active
                      ? "bg-primary/10 text-primary font-bold border-primary/20"
                      : "text-foreground/80 hover:bg-surface/5 hover:text-foreground"
                  }`}>
                  <item.icon size={17} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <div className="space-y-8 min-w-0">
          <div>
            <h1 className="text-2xl font-black text-foreground mb-1" style={{ letterSpacing: "-0.02em" }}>
              প্রোফাইল সেটিংস
            </h1>
            <p className="text-foreground/80 text-sm font-medium">আপনার ব্যক্তিগত তথ্য আপডেট করুন</p>
          </div>

          {/* Mobile Sub-Navigation Pill Bar (Mobile-only) */}
          <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-border">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface/5 text-foreground/80 hover:bg-surface/10 border border-border"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Avatar preview */}
          <div className="flex items-center gap-5 p-5 bg-surface/5 border border-border backdrop-blur-md rounded-2xl shadow-xl">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl shrink-0 shadow-[0_0_15px_rgba(200,144,10,0.35)]">
              {(user.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-black text-foreground text-base">{user.name}</p>
              <p className="text-foreground/80 text-sm font-medium">{user.email}</p>
            </div>
          </div>

          <ProfileForm
            initialName={user.name || ""}
            email={user.email || ""}
            initialPhone={(user as any).phone || ""}
          />
        </div>
      </div>
    </div>
  );
}
