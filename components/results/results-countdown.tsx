"use client";

import { useEffect, useState } from "react";

interface ResultsCountdownProps {
  endTime: string | null;
  status: string;
}

function getRemaining(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

export function ResultsCountdown({ endTime, status }: ResultsCountdownProps) {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null);

  useEffect(() => {
    if (status !== "active" || !endTime) return;

    const tick = () => setRemaining(getRemaining(endTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, status]);

  if (status === "completed") {
    return (
      <span className="rounded-full bg-muted/15 px-4 py-1.5 text-sm font-semibold text-muted">
        Election Ended
      </span>
    );
  }

  if (status !== "active" || !endTime) {
    return null;
  }

  if (!remaining) {
    return (
      <span className="rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
        Voting period ended
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-teal/20 bg-teal/5 px-5 py-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-teal">
        Time remaining
      </span>
      <div className="flex gap-2 font-mono text-lg font-bold text-ink">
        <span>{String(remaining.hours).padStart(2, "0")}h</span>
        <span className="text-muted">:</span>
        <span>{String(remaining.minutes).padStart(2, "0")}m</span>
        <span className="text-muted">:</span>
        <span>{String(remaining.seconds).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
