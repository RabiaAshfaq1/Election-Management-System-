"use client";

import { motion } from "framer-motion";
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
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="hero-rings pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center rounded-full border border-teal/20 bg-teal/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal">
              Secure · Transparent · Real-time
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-8 font-heading text-[2.75rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[7rem]"
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
              className="rounded-xl bg-teal px-7 py-3.5 text-sm font-semibold text-paper shadow-lg shadow-teal/25 transition hover:bg-teal-light"
            >
              Browse Elections
            </a>
            <Link
              href="/auth/signup"
              className="rounded-xl border border-border bg-white/60 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur transition hover:border-teal/30 hover:bg-white"
            >
              Request Creator Access
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-16 border-t border-border pt-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {statItems.map((s) => (
                <motion.div key={s.label}>
                  <p className="font-heading text-3xl font-bold text-ink lg:text-4xl">
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
