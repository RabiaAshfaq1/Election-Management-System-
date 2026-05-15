"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PublicElectionCard } from "@/components/landing/public-election-card";
import type { PublicElection } from "@/lib/elections/data";
import { cn } from "@/lib/utils";
import type { ElectionStatus } from "@/lib/types";

type StatusFilter = "all" | ElectionStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Upcoming" },
  { id: "active", label: "Live" },
  { id: "completed", label: "Completed" },
];

interface ElectionsDirectoryProps {
  elections: PublicElection[];
  categories: string[];
}

export function ElectionsDirectory({
  elections,
  categories,
}: ElectionsDirectoryProps) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return elections.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.organization.toLowerCase().includes(q) ||
        (e.category?.toLowerCase().includes(q) ?? false) ||
        (e.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [elections, status, category, search]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatus(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                status === tab.id
                  ? "bg-teal text-paper"
                  : "border border-border bg-white text-muted hover:text-ink"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {categories.length > 0 && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search elections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        Showing {filtered.length} of {elections.length} elections
      </p>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-white px-8 py-16 text-center">
          <p className="font-heading text-lg font-bold text-ink">
            No elections match your filters
          </p>
          <p className="mt-2 text-sm text-muted">
            Try adjusting search, category, or status.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((election) => (
            <PublicElectionCard key={election.id} election={election} />
          ))}
        </div>
      )}
    </div>
  );
}
