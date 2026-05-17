"use client";

import { ArrowRight } from "lucide-react";
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
  live: "bg-gradient-to-r from-teal via-teal-light to-gold",
  upcoming: "bg-gradient-to-r from-gold via-gold/60 to-transparent",
  completed: "bg-muted/40",
};

const badgeStyles = {
  live: "bg-teal/10 text-teal",
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
    <article className="group premium-card flex flex-col transition-[transform,box-shadow,border-color] duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2">
      <div className={cn("h-[3px] w-full", accentStyles[variant])} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize",
              badgeStyles[variant]
            )}
          >
            {variant === "live" && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
            )}
            {variant === "live"
              ? "Live"
              : variant === "upcoming"
                ? "Upcoming"
                : "Completed"}
          </span>
          {timeLabel && (
            <span
              className={cn(
                "text-right font-mono text-xs font-semibold",
                variant === "live" ? "text-teal" : "text-gold"
              )}
            >
              {timeLabel}
            </span>
          )}
        </div>

        <h3 className="mt-4 font-heading text-xl font-black leading-snug text-ink transition group-hover:text-teal">
          {election.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{election.organization}</p>

        <div className="mt-5 flex items-center">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="-ml-2 first:ml-0 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-teal/20 to-gold/30 text-[10px] font-bold text-teal shadow-soft"
            >
              {election.title.charAt(index).toUpperCase()}
            </div>
          ))}
          <span className="ml-3 text-xs font-medium text-muted">
            +{Math.max(election.voter_count - 3, 0).toLocaleString()} voters
          </span>
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex justify-between text-xs text-muted">
            <span>Voters registered</span>
            <span>
              {election.voter_count.toLocaleString()} /{" "}
              {election.max_voters.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-paper2">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                variant === "live" ? "from-teal to-teal-light" : "from-gold to-gold/70"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link
          href={`/elections/${election.id}`}
          className={cn(
            "group/link mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-semibold transition active:scale-[0.97]",
            variant === "live"
              ? "btn-primary"
              : "border border-border bg-white/50 text-ink hover:border-teal hover:bg-teal/5 hover:text-teal"
          )}
        >
          {action}
          <ArrowRight className="h-4 w-4 transition group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
