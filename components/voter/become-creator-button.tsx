"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { becomeElectionCreator } from "@/app/dashboard/voter/actions";

export function BecomeCreatorButton() {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleBecomeCreator() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      const result = await becomeElectionCreator();
      if (result?.error) {
        toast.error(result.error);
        setConfirming(false);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-teal/20 bg-teal/5 px-5 py-4">
      <p className="text-sm font-semibold text-ink">Want to run an election?</p>
      <p className="mt-1 text-sm text-muted">
        Switch to creator mode to set up elections, candidates, and results. You
        can still vote in other elections when registered.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleBecomeCreator}
          disabled={pending}
          className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light disabled:opacity-60"
        >
          {pending
            ? "Switching…"
            : confirming
              ? "Click again to confirm"
              : "Become election creator"}
        </button>
        {confirming && !pending ? (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-sm text-muted hover:text-ink"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
