"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

import { CandidateAvatar } from "@/components/creator/candidate-avatar";
import type { Candidate } from "@/lib/types";

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
  onEdit: (candidate: Candidate) => void;
  onDelete: (candidate: Candidate) => void;
}

export function CandidateCard({
  candidate,
  index,
  onEdit,
  onDelete,
}: CandidateCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex flex-col rounded-2xl border border-border bg-white p-6 shadow-card"
    >
      <div className="absolute right-4 top-4 flex gap-1">
        <button
          type="button"
          onClick={() => onEdit(candidate)}
          className="rounded-lg p-2 text-muted transition hover:bg-paper hover:text-teal"
          aria-label={`Edit ${candidate.name}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(candidate)}
          className="rounded-lg p-2 text-muted transition hover:bg-accent/10 hover:text-accent"
          aria-label={`Delete ${candidate.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex justify-center pt-2">
        <CandidateAvatar
          name={candidate.name}
          photoUrl={candidate.photo_url}
          size={80}
        />
      </div>

      <h3 className="text-center font-heading text-lg font-bold text-ink">
        {candidate.name}
      </h3>
      {candidate.designation && (
        <p className="mt-1 text-center text-sm text-muted">
          {candidate.designation}
        </p>
      )}
      {candidate.manifesto && (
        <p className="mt-3 line-clamp-2 text-center text-sm leading-relaxed text-ink/80">
          {candidate.manifesto}
        </p>
      )}
    </motion.article>
  );
}
