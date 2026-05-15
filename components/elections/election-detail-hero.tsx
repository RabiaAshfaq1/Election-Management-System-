import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { ElectionDetail } from "@/lib/elections/data";
import { getStatusLabel } from "@/lib/elections/status";
import { cn } from "@/lib/utils";

const statusBadgeStyles = {
  published: "bg-gold/15 text-ink",
  active: "bg-accent/10 text-accent",
  completed: "bg-muted/15 text-muted",
  draft: "bg-muted/15 text-muted",
};

interface ElectionDetailHeroProps {
  election: ElectionDetail;
}

export function ElectionDetailHero({ election }: ElectionDetailHeroProps) {
  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-28 lg:px-10 lg:pb-16 lg:pt-32">
        <Link
          href="/elections"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          All elections
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {election.category && (
            <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
              {election.category}
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              statusBadgeStyles[election.status]
            )}
          >
            {getStatusLabel(election.status)}
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl font-heading text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
          {election.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{election.organization}</p>
      </div>
    </div>
  );
}
