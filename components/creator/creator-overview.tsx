"use client";

import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";

import { CreatorStats } from "@/components/creator/creator-stats";
import type { ElectionCardData } from "@/components/creator/election-cards";

interface CreatorOverviewProps {
  activeCount: number;
  totalVoters: number;
  upcomingCount: number;
  activeElections: ElectionCardData[];
  upcomingDeadlines: ElectionCardData[];
}

export function CreatorOverview({
  activeCount,
  totalVoters,
  upcomingCount,
  activeElections,
  upcomingDeadlines,
}: CreatorOverviewProps) {
  return (
    <div className="space-y-8">
      <CreatorStats
        activeElections={activeCount}
        totalVoters={totalVoters}
        upcomingElections={upcomingCount}
      />

      <section>
        <h2 className="mb-4 font-heading text-xl font-bold text-ink">
          Active elections
        </h2>
        {activeElections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-white px-6 py-8 text-center text-sm text-muted">
            No elections are live right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {activeElections.map((e, i) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4"
              >
                <div>
                  <p className="font-medium text-ink">{e.title}</p>
                  <p className="text-xs text-muted">
                    {e.voter_count ?? 0} registered voters
                  </p>
                </div>
                <Link
                  href={`/elections/${e.id}/results`}
                  className="text-sm font-semibold text-teal hover:text-teal-light"
                >
                  Live results →
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-heading text-xl font-bold text-ink">
          Upcoming deadlines
        </h2>
        {upcomingDeadlines.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-white px-6 py-8 text-center text-sm text-muted">
            No registration deadlines coming up.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcomingDeadlines.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4"
              >
                <div>
                  <p className="font-medium text-ink">{e.title}</p>
                  <p className="text-xs text-muted">
                    Register by{" "}
                    {e.registration_deadline
                      ? format(
                          new Date(e.registration_deadline),
                          "MMM d, h:mm a"
                        )
                      : "—"}
                  </p>
                </div>
                <Link
                  href={
                    e.status === "draft"
                      ? `/dashboard/creator/elections/${e.id}/edit`
                      : `/dashboard/creator/elections/${e.id}/candidates`
                  }
                  className="text-sm font-semibold text-teal"
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
