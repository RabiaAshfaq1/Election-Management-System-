"use client";

import { UserPlus, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { CandidateCard } from "@/components/creator/candidate-card";
import { CandidateFormModal } from "@/components/creator/candidate-form-modal";
import { DeleteCandidateModal } from "@/components/creator/delete-candidate-modal";
import type { Candidate } from "@/lib/types";

interface CandidatesManagerProps {
  electionId: string;
  initialCandidates: Candidate[];
}

export function CandidatesManager({
  electionId,
  initialCandidates,
}: CandidatesManagerProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState<Candidate | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const refreshCandidates = useCallback(async () => {
    const res = await fetch(
      `/api/candidates?election_id=${encodeURIComponent(electionId)}`
    );
    const json = await res.json();
    if (res.ok) {
      setCandidates(json.candidates);
    }
  }, [electionId]);

  const handleSaved = (candidate: Candidate) => {
    setCandidates((prev) => {
      const exists = prev.some((c) => c.id === candidate.id);
      if (exists) {
        return prev.map((c) => (c.id === candidate.id ? candidate : c));
      }
      return [...prev, candidate];
    });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);

    const res = await fetch(`/api/candidates/${deleting.id}`, {
      method: "DELETE",
    });

    setDeleteLoading(false);

    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? "Failed to delete");
      return;
    }

    toast.success("Candidate deleted");
    setCandidates((prev) => prev.filter((c) => c.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light"
        >
          <UserPlus className="h-4 w-4" />
          Add Candidate
        </button>
      </div>

      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-8 py-20 text-center shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
            <Users className="h-8 w-8 text-teal" strokeWidth={1.75} />
          </div>
          <h3 className="font-heading text-xl font-bold text-ink">
            No candidates yet
          </h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Add candidates so voters can choose who to support in this election.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              index={index}
              onEdit={(c) => {
                setEditing(c);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <CandidateFormModal
        open={formOpen}
        electionId={electionId}
        candidate={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />

      <DeleteCandidateModal
        open={!!deleting}
        candidateName={deleting?.name ?? ""}
        loading={deleteLoading}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

