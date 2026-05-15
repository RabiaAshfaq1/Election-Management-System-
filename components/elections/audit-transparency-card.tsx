import { format } from "date-fns";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

import type { ElectionTransparencySummary } from "@/lib/audit/election-summary";

interface AuditTransparencyCardProps {
  summary: ElectionTransparencySummary;
}

export function AuditTransparencyCard({ summary }: AuditTransparencyCardProps) {
  return (
    <section className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-card lg:p-8">
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-6 w-6 shrink-0 text-teal" strokeWidth={1.75} />
        <div>
          <h2 className="font-heading text-xl font-bold text-ink">Audit Summary</h2>
          <p className="mt-1 text-sm text-muted">
            Transparency record for this election
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        <li className="flex items-start gap-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
          <span className="text-ink">
            <strong>{summary.total_votes.toLocaleString()}</strong> total votes
            cast
          </span>
        </li>

        <li className="flex items-start gap-3 text-sm">
          <CheckCircle2
            className={`mt-0.5 h-5 w-5 shrink-0 ${summary.voter_list_frozen_at ? "text-teal" : "text-muted"}`}
          />
          <span className="text-ink">
            {summary.voter_list_frozen_at ? (
              <>
                Voter list frozen at{" "}
                <strong>
                  {format(
                    new Date(summary.voter_list_frozen_at),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </strong>
              </>
            ) : (
              "Voter list freeze pending (IDs not yet finalized)"
            )}
          </span>
        </li>

        {summary.has_overrides ? (
          <li className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <span className="text-ink">
              <strong>{summary.override_count}</strong> admin override
              {summary.override_count === 1 ? "" : "s"} —{" "}
              <Link
                href="/dashboard/admin/audit"
                className="font-semibold text-teal hover:underline"
              >
                view log
              </Link>
            </span>
          </li>
        ) : (
          <li className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
            <span className="text-ink">No admin overrides</span>
          </li>
        )}

        <li className="flex items-start gap-3 text-sm">
          <CheckCircle2
            className={`mt-0.5 h-5 w-5 shrink-0 ${summary.results_verified ? "text-teal" : "text-gold"}`}
          />
          <span className="text-ink">
            {summary.results_verified
              ? "Results verified and locked"
              : "Results published — review audit log for exceptions"}
          </span>
        </li>
      </ul>
    </section>
  );
}
