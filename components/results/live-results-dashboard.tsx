"use client";

import { format } from "date-fns";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { CandidateRanking } from "@/components/results/candidate-ranking";
import { ResultsBarChart } from "@/components/results/results-bar-chart";
import { ResultsCountdown } from "@/components/results/results-countdown";
import { AuditTransparencyCard } from "@/components/elections/audit-transparency-card";
import type { ElectionTransparencySummary } from "@/lib/audit/election-summary";
import type { ElectionResultsData } from "@/lib/elections/results";
import { getStatusLabel } from "@/lib/elections/status";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface LiveResultsDashboardProps {
  electionId: string;
  initialData: ElectionResultsData;
  transparencySummary?: ElectionTransparencySummary | null;
}

const statusBadgeStyles = {
  published: "bg-gold/15 text-ink",
  active: "bg-accent/10 text-accent",
  completed: "bg-muted/15 text-muted",
  draft: "bg-muted/15 text-muted",
};

export function LiveResultsDashboard({
  electionId,
  initialData,
  transparencySummary,
}: LiveResultsDashboardProps) {
  const [data, setData] = useState(initialData);
  const [live, setLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/elections/${electionId}/results`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = (await res.json()) as ElectionResultsData;
        setData(json);
      }
    } finally {
      setRefreshing(false);
    }
  }, [electionId]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`votes:${electionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `election_id=eq.${electionId}`,
        },
        () => {
          fetchResults();
        }
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    const pollId = setInterval(fetchResults, 15000);

    return () => {
      clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, [electionId, fetchResults]);

  const { election } = data;
  const isCompleted = election.status === "completed";
  const showWinnerBanner = isCompleted && data.winner;

  const timeLabel = isCompleted
    ? election.end_time
      ? `Ended ${format(new Date(election.end_time), "MMM d, yyyy 'at' h:mm a")}`
      : "Election ended"
    : election.end_time
      ? null
      : "End time TBD";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href={`/elections/${electionId}`}
            className="text-sm font-medium text-teal hover:underline"
          >
            ← Back to election
          </Link>
          <h1 className="mt-4 font-heading text-4xl font-bold text-ink lg:text-5xl">
            {election.title}
          </h1>
          <p className="mt-2 text-muted">{election.organization}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                statusBadgeStyles[election.status]
              )}
            >
              {getStatusLabel(election.status)}
            </span>
            {live && election.status === "active" && (
              <span className="flex items-center gap-2 text-xs font-medium text-teal">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
                </span>
                Live updates
              </span>
            )}
            {refreshing && (
              <span className="text-xs text-muted">Updating…</span>
            )}
          </div>
        </div>
        <ResultsCountdown endTime={election.end_time} status={election.status} />
      </div>

      {showWinnerBanner && data.winner && (
        <div className="relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-teal via-teal-light to-teal px-8 py-10 text-center text-paper lg:px-12">
          <Trophy className="mx-auto h-12 w-12 text-gold" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-paper/80">
            Official winner
          </p>
          <h2 className="mt-2 font-heading text-4xl font-bold lg:text-5xl">
            {data.winner.name}
          </h2>
          <p className="mt-4 text-paper/85">
            {data.winner.vote_count.toLocaleString()} votes · {data.winner.percentage}%
          </p>
          <p className="mt-6 text-sm font-medium text-paper/70">
            Results are final and locked
          </p>
        </div>
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <ResultsBarChart candidates={data.candidates} />
        <CandidateRanking candidates={data.candidates} status={election.status} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Votes Cast"
          value={data.total_votes.toLocaleString()}
        />
        <StatCard
          label="Voter Turnout"
          value={`${data.turnout_percentage}%`}
        />
        <StatCard
          label="Total Registered Voters"
          value={data.total_registered.toLocaleString()}
        />
        <StatCard
          label={isCompleted ? "Ended At" : "Time Remaining"}
          value={
            isCompleted
              ? election.end_time
                ? format(new Date(election.end_time), "MMM d, h:mm a")
                : "—"
              : timeLabel ?? "See countdown above"
          }
          small={!isCompleted && Boolean(election.end_time)}
        />
      </div>

      {isCompleted && transparencySummary && (
        <AuditTransparencyCard summary={transparencySummary} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-heading font-bold text-ink",
          small ? "text-lg" : "text-3xl"
        )}
      >
        {value}
      </p>
    </div>
  );
}
