"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  type LucideIcon,
  Users,
  Vote,
  Zap,
} from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}

interface StatsGridProps {
  stats: {
    totalElections: number;
    activeElections: number;
    totalUsers: number;
    pendingRequests: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const items: StatItem[] = [
    {
      label: "Total Elections",
      value: stats.totalElections,
      icon: Vote,
      accent: "bg-teal/10 text-teal",
    },
    {
      label: "Active Elections",
      value: stats.activeElections,
      icon: Zap,
      accent: "bg-teal-light/15 text-teal-light",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      accent: "bg-gold/15 text-gold",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      icon: ClipboardList,
      accent: "bg-accent/10 text-accent",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="premium-card p-6"
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
          <p className="mt-4 font-heading text-4xl font-black text-ink">
            {item.value.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted">{item.label}</p>
          <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-teal via-gold to-transparent" />
        </motion.div>
      ))}
    </div>
  );
}
