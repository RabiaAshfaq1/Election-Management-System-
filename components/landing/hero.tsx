"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { PlatformStats } from "@/lib/landing/data";

interface HeroProps {
  stats: PlatformStats;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function formatStat(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return n.toLocaleString();
}

export function Hero({ stats }: HeroProps) {
  const statItems = [
    { label: "Active Elections", value: formatStat(stats.activeElections) },
    { label: "Votes Cast", value: formatStat(stats.votesCast) },
    { label: "Organizations", value: formatStat(stats.organizations) },
    { label: "Uptime", value: stats.uptime },
  ];

  return (
    <section className="relative overflow-hidden pb-20 pt-28 lg:pb-28 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(93,232,208,0.18),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(232,201,110,0.18),transparent_30%)]" />
      <div className="hero-rings pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          <motion.div variants={item}>
            <span className="status-pill border-teal/20 bg-teal/10 text-teal">
              Secure · Transparent · Real-time
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="display-heading mt-8 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[7rem]"
          >
            Democracy,{" "}
            <span className="italic text-teal">engineered</span> for the modern
            age.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-muted lg:text-xl"
          >
            VoteFlow powers secure online elections with anonymous ballots,
            live results, and audit trails you can trust—from campus clubs to
            enterprise organizations.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#elections"
              className="group btn-primary gap-2 px-7 py-3.5"
            >
              Browse Elections
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <Link
              href="/auth/signup"
              className="btn-ghost px-7 py-3.5"
            >
              Request Creator Access
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-16 glass-card rounded-[1.5rem] p-6">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {statItems.map((s) => (
                <motion.div key={s.label}>
                  <p className="font-heading text-3xl font-black text-ink lg:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
