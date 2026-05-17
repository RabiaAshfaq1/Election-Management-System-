import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import type { ElectionDetail } from "@/lib/elections/data";
import { getStatusLabel } from "@/lib/elections/status";
import { cn } from "@/lib/utils";

const statusBadgeStyles = {
  published: "bg-gold/15 text-ink",
  active: "bg-teal/10 text-teal",
  completed: "bg-muted/15 text-muted",
  draft: "bg-muted/15 text-muted",
};

interface ElectionDetailHeroProps {
  election: ElectionDetail;
}

export function ElectionDetailHero({ election }: ElectionDetailHeroProps) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(93,232,208,0.2),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(232,201,110,0.16),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-28 lg:px-10 lg:pb-16 lg:pt-32">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm font-medium text-muted">
          <Link
            href="/elections"
            className="inline-flex items-center gap-2 transition hover:text-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            Elections
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink">{election.title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {election.category && (
            <span className="status-pill border-teal/20 bg-teal/10 text-teal">
              {election.category}
            </span>
          )}
          <span
            className={cn(
              "status-pill",
              statusBadgeStyles[election.status]
            )}
          >
            {election.status === "active" && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
            )}
            {getStatusLabel(election.status)}
          </span>
        </div>

        <h1 className="display-heading mt-6 max-w-5xl text-4xl leading-[1.04] sm:text-5xl lg:text-7xl">
          {election.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{election.organization}</p>
      </div>
    </div>
  );
}
