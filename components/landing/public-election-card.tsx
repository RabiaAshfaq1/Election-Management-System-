"use client";

import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

import type { PublicElection } from "@/lib/elections/data";
import { cn } from "@/lib/utils";

function getCardVariant(
  election: PublicElection
): "live" | "upcoming" | "completed" {
  if (election.status === "active") return "live";
  if (election.status === "completed") return "completed";
  return "upcoming";
}

const accentStyles = {
  live: "bg-accent",
  upcoming: "bg-gold",
  completed: "bg-muted/40",
};

const badgeStyles = {
  live: "bg-accent/10 text-accent",
  upcoming: "bg-gold/15 text-ink",
  completed: "bg-muted/15 text-muted",
};

interface PublicElectionCardProps {
  election: PublicElection;
}

export function PublicElectionCard({ election }: PublicElectionCardProps) {
  const variant = getCardVariant(election);
  const progress = Math.min(
    100,
    Math.round((election.voter_count / election.max_voters) * 100)
  );

  const now = new Date();
  const start = election.start_time ? new Date(election.start_time) : null;
  const end = election.end_time ? new Date(election.end_time) : null;

  let timeLabel = "";
  if (variant === "live" && end) {
    timeLabel = `Ends ${formatDistanceToNow(end, { addSuffix: true })}`;
  } else if (variant === "upcoming" && start) {
    timeLabel = `Starts ${formatDistanceToNow(start, { addSuffix: true })}`;
  } else if (end) {
    timeLabel = `Ended ${format(end, "MMM d, yyyy")}`;
  }

  const action =
    variant === "live"
      ? "Cast Vote"
      : variant === "upcoming"
        ? "Join Election"
        : "View Results";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg">
      <div className={cn("h-1.5 w-full", accentStyles[variant])} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
              badgeStyles[variant]
            )}
          >
            {variant === "live"
              ? "Live"
              : variant === "upcoming"
                ? "Upcoming"
                : "Completed"}
          </span>
          {timeLabel && (
            <span className="text-right text-xs text-muted">{timeLabel}</span>
          )}
        </div>

        <h3 className="mt-4 font-heading text-xl font-bold leading-snug text-ink group-hover:text-teal">
          {election.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{election.organization}</p>

        <div className="mt-6">
          <div className="mb-1.5 flex justify-between text-xs text-muted">
            <span>Voters registered</span>
            <span>
              {election.voter_count.toLocaleString()} /{" "}
              {election.max_voters.toLocaleString()}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                variant === "live" ? "bg-accent" : "bg-teal"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link
          href={`/elections/${election.id}`}
          className={cn(
            "mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition",
            variant === "live"
              ? "bg-teal text-paper hover:bg-teal-light"
              : "border border-border text-ink hover:border-teal hover:text-teal"
          )}
        >
          {action}
        </Link>
      </div>
    </article>
  );
}
