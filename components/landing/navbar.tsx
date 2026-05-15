"use client";

import { Menu, X } from "lucide-react";
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
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-paper/80 shadow-sm backdrop-blur-xl"
          : "bg-paper/40 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="font-heading text-2xl font-bold text-ink">
          Vote<span className="italic text-teal">Flow</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/auth/login"
            className="text-sm font-medium text-ink transition hover:text-teal"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light"
          >
            Get Started
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-paper/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-ink"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/auth/login"
              className="py-2 text-sm font-medium text-ink"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl bg-teal px-5 py-3 text-center text-sm font-semibold text-paper"
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
