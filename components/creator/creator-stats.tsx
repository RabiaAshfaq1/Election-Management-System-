"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Zap } from "lucide-react";

interface CreatorStatsProps {
  activeElections: number;
  totalVoters: number;
  upcomingElections: number;
}

export function CreatorStats({
  activeElections,
  totalVoters,
  upcomingElections,
}: CreatorStatsProps) {
  const items = [
    {
      label: "Active elections",
      value: activeElections,
      icon: Zap,
      accent: "bg-teal/10 text-teal",
    },
    {
      label: "Total voters",
      value: totalVoters,
      icon: Users,
      accent: "bg-gold/15 text-gold",
    },
    {
      label: "Upcoming elections",
      value: upcomingElections,
      icon: Calendar,
      accent: "bg-teal-light/15 text-teal-light",
    },
  ];

  return (
    <div className="mb-10 grid gap-5 sm:grid-cols-3">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className="premium-card p-6"
        >
          <div
            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.accent}`}
          >
            <item.icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <p className="font-heading text-3xl font-black text-ink">
            {item.value.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted">{item.label}</p>
          <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-teal via-gold to-transparent" />
        </motion.div>
      ))}
    </div>
  );
}
