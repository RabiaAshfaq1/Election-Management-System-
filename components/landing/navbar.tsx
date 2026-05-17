"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/elections", label: "Elections" },
  { href: "#how-it-works", label: "How it Works" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b border-border transition-all duration-300",
        scrolled
          ? "bg-paper/80 shadow-soft backdrop-blur-[20px]"
          : "bg-paper/70 backdrop-blur-[20px]"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 font-heading text-2xl font-black tracking-[-0.04em] text-ink"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal text-sm text-white shadow-soft transition group-hover:rotate-3">
            V
          </span>
          Vote<span className="italic text-teal">Flow</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-muted transition hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-teal transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Link
            href="/auth/login"
            className="btn-ghost min-h-10 px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="group btn-primary min-h-10 gap-2 px-5 py-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </nav>

        <button
          type="button"
          className="min-h-11 rounded-xl border border-border bg-white/60 p-2 text-ink shadow-soft backdrop-blur-xl md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-paper/95 px-6 py-8 backdrop-blur-[24px] md:hidden">
          <nav className="mx-auto flex max-w-sm flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-border bg-white/60 px-5 py-4 text-lg font-semibold text-ink shadow-soft"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/auth/login"
              className="rounded-2xl border border-border bg-white/60 px-5 py-4 text-lg font-semibold text-ink shadow-soft"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-primary mt-2 py-4 text-base"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
