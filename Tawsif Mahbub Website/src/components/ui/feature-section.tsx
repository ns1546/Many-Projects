"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Bell,
  DollarSign,
  Users,
  Share2,
  FileBarChart,
  Bot,
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export interface TaskItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  image?: string;
}

const defaultTasks: TaskItem[] = [
  {
    title: "AI-powered notifications",
    subtitle: "Smart alerts for critical events",
    icon: <Bell className="w-4 h-4 text-blue-500" />,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
  },
  {
    title: "Automated payroll",
    subtitle: "Error-free salary processing",
    icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=120&q=80",
  },
  {
    title: "Employee insights",
    subtitle: "Track productivity in real-time",
    icon: <Users className="w-4 h-4 text-indigo-500" />,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=80",
  },
  {
    title: "Social campaigns",
    subtitle: "AI-curated content suggestions",
    icon: <Share2 className="w-4 h-4 text-purple-500" />,
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=120&q=80",
  },
  {
    title: "AI-driven reports",
    subtitle: "Weekly insights & performance",
    icon: <FileBarChart className="w-4 h-4 text-amber-500" />,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&q=80",
  },
];

export interface FeatureSectionProps {
  tasks?: TaskItem[];
  badgeText?: string;
  heading?: string;
  description?: string;
}

export default function FeatureSection({
  tasks = defaultTasks,
  badgeText = "Workflow Automation",
  heading = "Automate repetitive tasks",
  description = "we help you streamline operations with AI-driven automation — from payroll and reporting to employee tracking and smart notifications. Our solutions reduce human error, save time, and scale effortlessly with your business needs.",
}: FeatureSectionProps) {
  return (
    <section className="relative w-full py-20 px-4 bg-background text-foreground">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* LEFT SIDE - Task Loop with Vertical Bar */}
        <div className="relative w-full max-w-sm mx-auto md:mx-0">
          <Card className="overflow-hidden bg-muted/30 dark:bg-muted/20 backdrop-blur-md shadow-xl rounded-lg border border-border/50">
            <CardContent className="relative h-[320px] p-0 overflow-hidden">
              {/* Scrollable Container */}
              <div className="relative h-full overflow-hidden">
                {/* Motion list */}
                <motion.div
                  className="flex flex-col gap-2 absolute w-full"
                  animate={{ y: ["0%", "-50%"] }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 14,
                    ease: "linear",
                  }}
                >
                  {[...tasks, ...tasks].map((task, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 relative"
                    >
                      {/* Icon + Content */}
                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-2">
                          {task.image ? (
                            <img
                              src={task.image}
                              alt={task.title}
                              className="w-10 h-10 rounded-xl object-cover shadow-md shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded-xl shadow-md shrink-0 flex items-center justify-center">
                              {task.icon}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                            <p className="text-xs text-gray-500">{task.subtitle}</p>
                          </div>
                        </div>
                        {task.icon}
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Fade effect only inside card */}
                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-background via-background/70 to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none z-10" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE - Content */}
        <div className="space-y-6">
          <Badge variant="secondary" className="px-3 py-1 text-sm inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {badgeText}
          </Badge>
          <h3 className="text-lg sm:text-md lg:text-2xl font-normal text-gray-900 dark:text-white leading-relaxed">
            {heading}{" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-2xl">
              {description}
            </span>
          </h3>

          <div className="flex gap-3 flex-wrap">
            <Badge className="px-4 py-2 text-sm inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              AI Task Bots
            </Badge>
            <Badge className="px-4 py-2 text-sm inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              100+ Automations
            </Badge>
            <Badge className="px-4 py-2 text-sm inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Enterprise Ready
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
