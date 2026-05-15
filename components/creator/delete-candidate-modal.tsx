"use client";

import { Loader2, X } from "lucide-react";

interface DeleteCandidateModalProps {
  open: boolean;
  candidateName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCandidateModal({
  open,
  candidateName,
  loading,
  onClose,
  onConfirm,
}: DeleteCandidateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-card"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-paper"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-ink">
          Delete candidate?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Remove <span className="font-medium text-ink">{candidateName}</span>{" "}
          from this election. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-paper hover:bg-accent/90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
