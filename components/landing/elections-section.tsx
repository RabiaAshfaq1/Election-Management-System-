"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FadeIn } from "@/components/landing/fade-in";
import { PublicElectionCard } from "@/components/landing/public-election-card";
import type { PublicElection } from "@/lib/landing/data";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "live" | "upcoming" | "completed";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

function matchesFilter(election: PublicElection, tab: FilterTab) {
  if (tab === "all") return true;
  if (tab === "live") return election.status === "active";
  if (tab === "completed") return election.status === "completed";
  return election.status === "published";
}

interface ElectionsSectionProps {
  elections: PublicElection[];
}

export function ElectionsSection({ elections }: ElectionsSectionProps) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return elections.filter((e) => {
      if (!matchesFilter(e, tab)) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.organization.toLowerCase().includes(q) ||
        (e.category?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [elections, tab, search]);

  return (
    <section id="elections" className="scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <FadeIn>
          <h2 className="font-heading text-4xl font-bold text-ink lg:text-5xl">
            Ongoing & Upcoming
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Discover elections open for registration, live voting, and published
            results.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  tab === t.id
                    ? "bg-teal text-paper"
                    : "bg-white text-muted hover:text-ink"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative max-w-sm flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search elections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-12">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white px-8 py-16 text-center">
              <p className="font-heading text-lg font-bold text-ink">
                No elections found
              </p>
              <p className="mt-2 text-sm text-muted">
                Try another filter or check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((election) => (
                <PublicElectionCard key={election.id} election={election} />
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
