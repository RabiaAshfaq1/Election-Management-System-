"use client";

import { format } from "date-fns";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

export interface AdminElectionRow {
  id: string;
  title: string;
  status: string;
  start_time: string | null;
  created_at: string;
  creator_name: string;
  voter_count: number;
}

const STATUS_OPTIONS = ["all", "draft", "published", "active", "completed"] as const;

interface ElectionsTableProps {
  elections: AdminElectionRow[];
}

export function ElectionsTable({ elections }: ElectionsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return elections.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.creator_name.toLowerCase().includes(q)
      );
    });
  }, [elections, search, statusFilter]);

  const csvRows = filtered.map((e) => [
    e.title,
    e.creator_name,
    e.status,
    String(e.voter_count),
    e.start_time ? format(new Date(e.start_time), "yyyy-MM-dd") : "",
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search title or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as (typeof STATUS_OPTIONS)[number])
            }
            className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-teal"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>
          <CsvExportButton
            filename="elections.csv"
            headers={["Title", "Creator", "Status", "Voters", "Start date"]}
            rows={csvRows}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🗳️"
          title="No elections found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-paper/60">
                  <th className="px-5 py-3.5 font-semibold text-ink">Title</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Creator</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Voters</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Start</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-paper/40">
                    <td className="px-5 py-4 font-medium text-ink">{e.title}</td>
                    <td className="px-5 py-4 text-muted">{e.creator_name}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          e.status === "active" && "bg-teal/10 text-teal",
                          e.status === "completed" && "bg-paper text-muted",
                          e.status === "published" && "bg-amber-50 text-amber-800",
                          e.status === "draft" && "bg-border/50 text-muted"
                        )}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{e.voter_count}</td>
                    <td className="px-5 py-4 text-muted">
                      {e.start_time
                        ? format(new Date(e.start_time), "MMM d, yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
