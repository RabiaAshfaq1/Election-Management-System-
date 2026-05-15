"use client";

import Link from "next/link";

import { FadeIn } from "@/components/landing/fade-in";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-28">
      <div
        className="absolute inset-0 bg-gradient-to-br from-teal via-teal-light to-teal"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
        <FadeIn>
          <h2 className="font-heading text-4xl font-bold text-paper lg:text-5xl">
            Ready to run your next election?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-paper/85">
            Join organizations who trust VoteFlow for secure, transparent,
            modern democracy.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-xl bg-paper px-8 py-3.5 text-sm font-semibold text-teal shadow-lg transition hover:bg-white"
            >
              Get Started Free
            </Link>
            <a
              href="#elections"
              className="rounded-xl border border-paper/40 px-8 py-3.5 text-sm font-semibold text-paper transition hover:bg-paper/10"
            >
              Browse Elections
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
