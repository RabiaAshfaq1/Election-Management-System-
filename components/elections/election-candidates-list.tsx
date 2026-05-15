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
      <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
        <p className="font-heading text-lg font-bold text-ink">No candidates yet</p>
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
            className="flex gap-4 rounded-2xl border border-border bg-white p-5 shadow-card"
          >
            <CandidateAvatar
              name={candidate.name}
              photoUrl={candidate.photo_url}
              size={72}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-lg font-bold text-ink">
                {candidate.name}
              </h3>
              {candidate.designation && (
                <p className="text-sm text-teal">{candidate.designation}</p>
              )}
              {candidate.manifesto && (
                <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-4">
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
