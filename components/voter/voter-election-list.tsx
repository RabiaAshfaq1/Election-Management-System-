"use client";

import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { SecretIdDisplay } from "@/components/voter/secret-id-display";
import { getStatusLabel } from "@/lib/elections/status";
import type { VoterElectionRow } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

interface VoterElectionListProps {
  elections: VoterElectionRow[];
}

function VotingStatus({ row }: { row: VoterElectionRow }) {
  if (row.has_voted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
        Voted ✓
      </span>
    );
  }

  if (row.status === "active") {
    return (
      <Link
        href={`/elections/${row.id}/vote`}
        className="inline-flex animate-pulse rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-paper shadow-sm transition hover:bg-teal-light"
      >
        Vote Now
      </Link>
    );
  }

  if (row.status === "completed") {
    return (
      <Link
        href={`/elections/${row.id}/results`}
        className="text-sm font-semibold text-teal hover:text-teal-light"
      >
        View Results
      </Link>
    );
  }

  return (
    <span className="text-sm text-muted">Registration Pending</span>
  );
}

export function VoterElectionList({ elections }: VoterElectionListProps) {
  if (elections.length === 0) {
    return (
      <EmptyState
        emoji="🗳️"
        title="No elections yet"
        description="Browse open elections and register to participate."
        action={
          <Link
            href="/elections"
            className="inline-flex rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper hover:bg-teal-light"
          >
            Browse elections
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {elections.map((row, index) => (
        <motion.li
          key={row.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-2xl border border-border bg-white p-5 shadow-card"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/elections/${row.id}`}
                className="font-heading text-lg font-bold text-ink hover:text-teal"
              >
                {row.title}
              </Link>
              <p className="mt-1 text-xs text-muted">
                Registered {format(new Date(row.registered_at), "MMM d, yyyy")}
                {row.start_time &&
                  ` · Starts ${format(new Date(row.start_time), "MMM d, h:mm a")}`}
              </p>
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
                  Secret voter ID
                </p>
                <SecretIdDisplay secretId={row.secret_id} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                  row.status === "active" && "bg-teal/10 text-teal",
                  row.status === "completed" && "bg-paper text-muted",
                  row.status === "published" && "bg-amber-50 text-amber-800"
                )}
              >
                {getStatusLabel(row.status)}
              </span>
              <VotingStatus row={row} />
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
