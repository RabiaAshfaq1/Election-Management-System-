"use client";

import { FadeIn } from "@/components/landing/fade-in";

const STEPS = [
  {
    step: "01",
    title: "Request creator access",
    description:
      "Organizations apply to run elections. Super admins review and approve with a single click.",
  },
  {
    step: "02",
    title: "Configure your election",
    description:
      "Set schedules, voter caps, and candidates. Publish when you are ready to open registration.",
  },
  {
    step: "03",
    title: "Voters receive secret IDs",
    description:
      "Registered voters get unique credentials. Ballots remain anonymous and double-vote protected.",
  },
  {
    step: "04",
    title: "Results in real time",
    description:
      "Live dashboards update as votes are cast. Audit logs capture every administrative action.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-paper py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <FadeIn>
          <h2 className="font-heading text-4xl font-bold text-ink lg:text-5xl">
            How it works
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            From approval to certified results in four clear steps.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, index) => (
            <FadeIn key={item.step} delay={index * 0.08}>
              <div className="relative">
                <span className="font-heading text-5xl font-bold text-teal/20">
                  {item.step}
                </span>
                <h3 className="mt-4 font-heading text-xl font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
