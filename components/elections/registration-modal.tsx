"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";

interface RegistrationModalProps {
  open: boolean;
  electionTitle: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RegistrationModal({
  open,
  electionTitle,
  loading,
  onClose,
  onConfirm,
}: RegistrationModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-paper hover:text-ink"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="registration-modal-title"
          className="font-heading text-2xl font-bold text-ink"
        >
          Confirm Registration
        </h2>
        <p className="mt-2 text-sm text-muted">
          You are registering for{" "}
          <span className="font-medium text-ink">{electionTitle}</span>.
        </p>

        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-teal focus:ring-teal"
          />
          <span className="text-sm leading-relaxed text-ink">
            I agree to participate honestly, keep my secret voter ID confidential,
            and follow this election&apos;s rules and code of conduct.
          </span>
        </label>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!accepted || loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal py-3 text-sm font-semibold text-paper transition hover:bg-teal-light disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
