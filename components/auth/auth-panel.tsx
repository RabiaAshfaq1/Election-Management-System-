"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Lock, Vote } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "End-to-end security",
    description: "Anonymous ballots with audit trails you can trust.",
  },
  {
    icon: Vote,
    title: "Built for real elections",
    description: "From campus clubs to organizations of any size.",
  },
  {
    icon: CheckCircle2,
    title: "Live results",
    description: "Watch turnout and results update in real time.",
  },
];

export function AuthPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:block"
    >
      <motion.div
        className="relative flex h-full min-h-[520px] flex-col justify-between overflow-hidden rounded-2xl bg-teal p-10 text-paper shadow-card"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-light/30"
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-gold/20"
          aria-hidden
        />

        <div className="relative">
          <p className="font-heading text-3xl font-bold italic leading-tight">
            Democracy,
            <br />
            done right.
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/80">
            VoteFlow helps you run secure, transparent online elections with
            confidence.
          </p>
        </div>

        <ul className="relative mt-10 space-y-5">
          {features.map((feature, index) => (
            <motion.li
              key={feature.title}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
              className="flex gap-3"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper/15">
                <feature.icon className="h-4 w-4 text-gold" strokeWidth={2} />
              </span>
              <div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-paper/70">
                  {feature.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
