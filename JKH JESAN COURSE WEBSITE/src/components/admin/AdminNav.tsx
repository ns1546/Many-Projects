"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BookOpen, 
  Users, 
  PlusCircle, 
  Settings, 
  Trash2, 
  Image as ImageIcon, 
  Database,
  ShieldAlert,
  Target
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  iconName: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BookOpen,
  PlusCircle,
  ImageIcon,
  Settings,
  Database,
  ShieldAlert,
  Trash2,
};

export default function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8900A] px-3 pt-2 pb-2">
        ম্যানেজমেন্ট
      </p>
      {items.map((item) => {
        const IconComponent = iconMap[item.iconName] || LayoutDashboard;
        const isActive = item.href === "/admin" 
          ? pathname === "/admin" 
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
              isActive
                ? "bg-primary/20 text-white font-bold border border-primary/40 shadow-[0_0_12px_rgba(200,144,10,0.25)]"
                : "text-[#F2EDE4]/85 hover:text-white hover:bg-white/10 font-medium"
            }`}
          >
            <IconComponent
              size={18}
              className={`transition-colors shrink-0 ${
                isActive ? "text-primary" : "text-[#A8A296] group-hover:text-primary"
              }`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
