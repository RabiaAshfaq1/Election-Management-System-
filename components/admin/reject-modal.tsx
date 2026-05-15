"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface RejectModalProps {
  open: boolean;
  organization: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectModal({
  open,
  organization,
  loading,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-card"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted transition hover:bg-paper hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="reject-modal-title"
          className="font-heading text-xl font-bold text-ink"
        >
          Reject request
        </h2>
        <p className="mt-2 text-sm text-muted">
          Reject the election creator request from{" "}
          <span className="font-medium text-ink">{organization}</span>. The
          applicant will receive your reason by email.
        </p>

        <label htmlFor="rejection-reason" className="mt-5 block text-sm font-medium text-ink">
          Rejection reason
        </label>
        <textarea
          id="rejection-reason"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this request was not approved..."
          className="mt-1.5 w-full resize-none rounded-xl border border-border bg-paper px-4 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !reason.trim()}
            onClick={() => onConfirm(reason)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent/90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm reject
          </button>
        </div>
      </div>
    </div>
  );
}
