import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import {
  Repeat,
  Home,
  Layout,
  Terminal,
} from "lucide-react";

export function FloatingDockDemo() {
  const links = [
    {
      title: "Home",
      icon: (
        <Home className="h-full w-full text-foreground-muted dark:text-foreground" />
      ),
      href: "#",
    },
    {
      title: "Products",
      icon: (
        <Terminal className="h-full w-full text-foreground-muted dark:text-foreground" />
      ),
      href: "#",
    },
    {
      title: "Components",
      icon: (
        <Layout className="h-full w-full text-foreground-muted dark:text-foreground" />
      ),
      href: "#",
    },
    {
      title: "Aceternity UI",
      icon: (
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=64&h=64&auto=format&fit=crop"
          className="rounded-full object-cover"
          width={20}
          height={20}
          alt="Retro console"
        />
      ),
      href: "#",
    },
    {
      title: "Changelog",
      icon: (
        <Repeat className="h-full w-full text-foreground-muted dark:text-foreground" />
      ),
      href: "#",
    },
    {
      title: "Twitter",
      icon: (
        <IconBrandTwitter className="h-full w-full text-foreground-muted dark:text-foreground" />
      ),
      href: "#",
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-foreground-muted dark:text-foreground" />
      ),
      href: "#",
    },
  ];
  return (
    <div className="flex h-140 w-full items-center justify-center">
      <FloatingDock mobileClassName="translate-y-20" items={links} />
    </div>
  );
}

export default FloatingDockDemo;
