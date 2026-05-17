"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface SidebarNavProps {
  items: NavItem[];
  subtitle: string;
  homeHref: string;
  footer?: React.ReactNode;
}

export function SidebarNav({
  items,
  subtitle,
  homeHref,
  footer,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-6 py-6">
        <Link href={homeHref} className="group block">
          <span className="inline-flex items-center gap-3 font-heading text-xl font-black tracking-[-0.04em] text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal text-sm text-white shadow-soft transition group-hover:rotate-3">
              V
            </span>
            Vote<span className="text-teal">Flow</span>
          </span>
          <span className="mt-3 block text-xs font-medium uppercase tracking-wider text-muted">
            {subtitle}
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "border-l-[3px] border-teal bg-teal/10 text-teal"
                  : "border-l-[3px] border-transparent text-muted hover:bg-teal/5 hover:text-ink"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive ? "text-teal" : "text-muted")}
                strokeWidth={isActive ? 2.25 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {footer ? (
        <div className="border-t border-border bg-white/40 px-4 py-4">{footer}</div>
      ) : null}

      <div className="mt-auto border-t border-border bg-white/40 px-3 py-4">
        <SignOutButton />
      </div>
    </div>
  );
}
