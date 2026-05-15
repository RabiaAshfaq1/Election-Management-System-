"use client";

import {
  BarChart3,
  Bell,
  Database,
  FileText,
  KeyRound,
  Lock,
  Rocket,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FadeIn } from "@/components/landing/fade-in";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: KeyRound,
    title: "Secret Voter IDs",
    description:
      "Unique credentials unlink ballots from identities while preventing double voting.",
  },
  {
    icon: BarChart3,
    title: "Live Vote Counting",
    description:
      "Watch turnout and results update in real time as votes are cast.",
  },
  {
    icon: Database,
    title: "Row Level Security",
    description:
      "Supabase RLS ensures every role sees only what they are permitted to.",
  },
  {
    icon: FileText,
    title: "Audit Trail",
    description:
      "Immutable logs capture administrative actions for full accountability.",
  },
  {
    icon: Lock,
    title: "Auto-Lock",
    description:
      "Elections automatically respect start, end, and registration windows.",
  },
  {
    icon: Bell,
    title: "Email Automation",
    description:
      "Verification, approvals, and notifications powered by Resend.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Super admins, creators, and voters each get purpose-built dashboards.",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description:
      "Ship securely on Vercel with a modern Next.js 14 stack.",
  },
];

export function Features() {
  return (
    <section className="bg-ink py-24 text-paper lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <FadeIn>
          <h2 className="max-w-2xl font-heading text-4xl font-bold lg:text-5xl">
            Built for elections you can defend in public
          </h2>
          <p className="mt-4 max-w-xl text-paper/70">
            Every layer—from database policies to anonymous ballots—is designed
            for trust.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.05}>
              <div className="group h-full rounded-2xl border border-paper/10 bg-paper/5 p-6 transition hover:border-teal/40 hover:bg-paper/10">
                <feature.icon
                  className="h-8 w-8 text-gold transition group-hover:text-teal-light"
                  strokeWidth={1.75}
                />
                <h3 className="mt-4 font-heading text-lg font-bold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/65">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
