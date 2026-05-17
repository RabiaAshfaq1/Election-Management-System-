"use client";

import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";

import type { VoterElectionRow } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

interface VoterOverviewProps {
  elections: VoterElectionRow[];
  stats: { total: number; active: number; voted: number; pending: number };
}

export function VoterOverview({ elections, stats }: VoterOverviewProps) {
  const preview = elections.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Registered", value: stats.total },
          { label: "Active now", value: stats.active },
          { label: "Voted", value: stats.voted },
          { label: "Pending vote", value: stats.pending },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="premium-card px-5 py-4"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className="mt-1 font-heading text-3xl font-black text-ink">
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-black text-ink">
            Voting status
          </h2>
          <Link
            href="/dashboard/voter/elections"
            className="text-sm font-semibold text-teal hover:text-teal-light"
          >
            View all →
          </Link>
        </div>

        {preview.length === 0 ? (
          <div className="glass-card rounded-2xl border-dashed px-6 py-10 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-teal/10 text-2xl">
              ◌
            </div>
            <p className="text-sm text-muted">
              Register for an election to see your status here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {preview.map((row) => {
              let statusLabel = "Registration Pending";
              let statusClass = "text-muted";

              if (row.has_voted) {
                statusLabel = "Voted ✓";
                statusClass = "text-emerald-600 font-semibold";
              } else if (row.status === "active") {
                statusLabel = "Vote Now";
                statusClass = "text-teal font-semibold";
              } else if (row.status === "completed") {
                statusLabel = "View Results";
                statusClass = "text-teal";
              }

              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-white/70 px-4 py-3 shadow-soft transition hover:bg-teal/5"
                >
                  <div>
                    <p className="font-medium text-ink">{row.title}</p>
                    {row.start_time && (
                      <p className="text-xs text-muted">
                        {format(new Date(row.start_time), "MMM d, h:mm a")}
                      </p>
                    )}
                  </div>
                  <span className={cn("text-sm", statusClass)}>{statusLabel}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
