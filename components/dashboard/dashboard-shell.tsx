"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DashboardShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function DashboardShell({ sidebar, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-ink hover:bg-paper"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-heading text-lg font-bold text-ink">
          Vote<span className="text-teal">Flow</span>
        </span>
        <div className="w-10" />
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-white transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-5 rounded-lg p-1.5 text-muted hover:bg-paper lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex h-full flex-col">{sidebar}</div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 lg:ml-64 lg:p-8 xl:p-10">
        {children}
      </main>
    </div>
  );
}
