"use client";

import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { ElectionCardActions } from "@/components/creator/election-card-actions";
import { StatusBadge } from "@/components/creator/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { ElectionCardData } from "@/lib/dashboard/types";

export type { ElectionCardData };

interface ElectionCardsProps {
  elections: ElectionCardData[];
}

export function ElectionCards({ elections }: ElectionCardsProps) {
  if (elections.length === 0) {
    return (
      <EmptyState
        emoji="🗳️"
        title="No elections yet"
        description="Create your first election to start managing candidates and voters."
        action={
          <Link
            href="/dashboard/creator/create"
            className="inline-flex rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light"
          >
            Create Election
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {elections.map((election, index) => (
        <motion.article
          key={election.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.35 }}
          className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-bold leading-snug text-ink">
              {election.title}
            </h3>
            <StatusBadge status={election.status} />
          </div>

          {election.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              {election.description}
            </p>
          )}

          <div className="mt-4 space-y-2 text-xs text-muted">
            {election.category && (
              <p className="font-medium text-ink/80">{election.category}</p>
            )}
            {election.start_time && (
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(election.start_time), "MMM d, yyyy · h:mm a")}
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {election.voter_count ?? 0} / {election.max_voters} voters
            </p>
          </div>

          <ElectionCardActions
            electionId={election.id}
            title={election.title}
            status={election.status}
          />
        </motion.article>
      ))}
    </div>
  );
}
