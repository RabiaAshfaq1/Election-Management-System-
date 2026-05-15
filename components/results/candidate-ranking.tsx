"use client";

import { Trophy } from "lucide-react";

import { CandidateAvatar } from "@/components/creator/candidate-avatar";
import type { ResultsCandidate } from "@/lib/elections/results";
import { cn } from "@/lib/utils";
import type { ElectionStatus } from "@/lib/types";

interface CandidateRankingProps {
  candidates: ResultsCandidate[];
  status: ElectionStatus;
}

const rankStyles: Record<number, string> = {
  1: "border-gold bg-gold/5 shadow-md shadow-gold/10",
  2: "border-teal/30 bg-white",
  3: "border-border bg-white",
};

export function CandidateRanking({ candidates, status }: CandidateRankingProps) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
        No candidates on the ballot
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-ink">Standings</h2>
      {candidates.map((candidate) => {
        const isFirst = candidate.rank === 1;
        const showLeaderBadge =
          isFirst && candidate.vote_count > 0 && status !== "completed";
        const showWinnerBadge =
          isFirst && candidate.vote_count > 0 && status === "completed";

        return (
          <article
            key={candidate.id}
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 p-5 transition",
              rankStyles[candidate.rank] ?? "border-border bg-white"
            )}
          >
            {(showLeaderBadge || showWinnerBadge) && (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-ink">
                <Trophy className="h-3.5 w-3.5 text-gold" />
                {showWinnerBadge ? "Winner" : "Leading"}
              </span>
            )}

            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-lg font-bold",
                  isFirst ? "bg-gold text-ink" : "bg-paper text-muted"
                )}
              >
                {candidate.rank}
              </span>
              <CandidateAvatar
                name={candidate.name}
                photoUrl={candidate.photo_url}
                size={56}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-lg font-bold text-ink">
                  {candidate.name}
                </h3>
                {candidate.designation && (
                  <p className="text-sm text-teal">{candidate.designation}</p>
                )}
                <p className="mt-2 text-sm text-muted">
                  <span className="font-semibold text-ink">
                    {candidate.vote_count.toLocaleString()}
                  </span>{" "}
                  votes · {candidate.percentage}%
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${candidate.percentage}%`,
                      backgroundColor: candidate.bar_color,
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
