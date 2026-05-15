"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { FadeIn } from "@/components/landing/fade-in";

const BULLETS = [
  "Aggregate counts without exposing individual ballots",
  "Real-time bar charts as votes arrive",
  "Creator and admin dashboards stay in sync",
  "Export-ready summaries when elections close",
];

const MOCK_RESULTS = [
  { name: "Amara Chen", pct: 42, color: "bg-teal" },
  { name: "Jordan Lee", pct: 35, color: "bg-gold" },
  { name: "Samira Patel", pct: 23, color: "bg-teal-light" },
];

export function ResultsPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-10">
        <FadeIn>
          <p className="text-sm font-semibold uppercase tracking-wider text-teal">
            Live results
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold text-ink lg:text-5xl">
            Clarity the moment votes land
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Stakeholders see turnout and standings without compromising voter
            anonymity. VoteFlow separates identity from ballot data end to end.
          </p>
          <ul className="mt-8 space-y-3">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div
            ref={ref}
            className="rounded-2xl border border-border bg-white p-8 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Student Council 2026
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-ink">
                  Live standings
                </p>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Live
              </span>
            </div>

            <p className="mt-6 text-sm text-muted">
              <span className="font-semibold text-ink">1,248</span> votes counted
            </p>

            <div className="mt-8 space-y-5">
              {MOCK_RESULTS.map((row, i) => (
                <div key={row.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-ink">{row.name}</span>
                    <span className="text-muted">{row.pct}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-paper">
                    <motion.div
                      className={`h-full rounded-full ${row.color}`}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${row.pct}%` } : { width: 0 }}
                      transition={{
                        duration: 0.9,
                        delay: 0.2 + i * 0.15,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-muted">
              Illustrative preview — connect your election for live data
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
