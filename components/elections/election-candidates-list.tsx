import { CandidateAvatar } from "@/components/creator/candidate-avatar";
import type { Candidate } from "@/lib/types";

interface ElectionCandidatesListProps {
  candidates: Candidate[];
}

export function ElectionCandidatesList({
  candidates,
}: ElectionCandidatesListProps) {
  if (candidates.length === 0) {
    return (
      <div className="glass-card rounded-2xl border-dashed px-6 py-12 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold/10 text-3xl">
          ◍
        </div>
        <p className="mt-4 font-heading text-lg font-bold text-ink">No candidates yet</p>
        <p className="mt-2 text-sm text-muted">
          Candidates will appear here once the organizer adds them.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-ink">Candidates</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {candidates.map((candidate) => (
          <article
            key={candidate.id}
            className="premium-card flex gap-5 p-5 hover:-translate-y-1"
          >
            <div className="shrink-0 rounded-full border-2 border-teal p-1 shadow-soft">
              <CandidateAvatar
                name={candidate.name}
                photoUrl={candidate.photo_url}
                size={80}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-xl font-black text-ink">
                {candidate.name}
              </h3>
              {candidate.designation && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{candidate.designation}</p>
              )}
              {candidate.manifesto && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                  {candidate.manifesto}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
