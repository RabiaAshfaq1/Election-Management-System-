"use client";

import {
  BarChart3,
  Download,
  Loader2,
  Pencil,
  Play,
  Square,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  publishElection,
  startElection,
  stopElection,
} from "@/app/dashboard/creator/actions";
import type { ElectionStatus } from "@/lib/types";
import { downloadCsv } from "@/lib/csv-export";

interface ElectionCardActionsProps {
  electionId: string;
  title: string;
  status: ElectionStatus;
}

export function ElectionCardActions({
  electionId,
  title,
  status,
}: ElectionCardActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function runAction(
    key: string,
    fn: () => Promise<{ error?: string; success?: boolean }>
  ) {
    setLoading(key);
    const result = await fn();
    setLoading(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Done");
    router.refresh();
  }

  async function finalizeVoters() {
    setLoading("finalize");
    try {
      const res = await fetch(`/api/elections/${electionId}/finalize-voters`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to finalize voters");
        return;
      }
      toast.success(
        `Generated ${data.generated ?? 0} IDs, emailed ${data.emailed ?? 0}`
      );
      router.refresh();
    } catch {
      toast.error("Failed to finalize voters");
    } finally {
      setLoading(null);
    }
  }

  async function downloadReport() {
    setLoading("report");
    try {
      const res = await fetch(`/api/elections/${electionId}/results`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not load results");
        return;
      }
      const headers = ["Candidate", "Votes", "Percentage"];
      const rows = (data.candidates ?? []).map(
        (c: { name: string; vote_count: number; percentage: number }) => [
          c.name,
          String(c.vote_count),
          `${c.percentage}%`,
        ]
      );
      downloadCsv(
        `${title.replace(/[^a-z0-9]/gi, "_")}_report.csv`,
        headers,
        rows
      );
    } catch {
      toast.error("Download failed");
    } finally {
      setLoading(null);
    }
  }

  const btn =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-60";
  const primary = `${btn} bg-teal text-paper hover:bg-teal-light`;
  const secondary = `${btn} border border-border bg-white text-ink hover:bg-paper`;
  const danger = `${btn} border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20`;

  const spin = (key: string) =>
    loading === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null;

  if (status === "draft") {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/dashboard/creator/elections/${electionId}/edit`} className={secondary}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
        <button
          type="button"
          disabled={!!loading}
          className={primary}
          onClick={() => runAction("publish", () => publishElection(electionId))}
        >
          {spin("publish")}
          <Upload className="h-3.5 w-3.5" />
          Publish
        </button>
      </div>
    );
  }

  if (status === "published") {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/creator/elections/${electionId}/candidates`}
          className={secondary}
        >
          <Users className="h-3.5 w-3.5" />
          Manage Candidates
        </Link>
        <button
          type="button"
          disabled={!!loading}
          className={secondary}
          onClick={finalizeVoters}
        >
          {spin("finalize")}
          Finalize Voters
        </button>
        <button
          type="button"
          disabled={!!loading}
          className={primary}
          onClick={() => runAction("start", () => startElection(electionId))}
        >
          {spin("start")}
          <Play className="h-3.5 w-3.5" />
          Start Election
        </button>
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/elections/${electionId}/results`}
          className={primary}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          View Live Results
        </Link>
        <button
          type="button"
          disabled={!!loading}
          className={danger}
          onClick={() => runAction("stop", () => stopElection(electionId))}
        >
          {spin("stop")}
          <Square className="h-3.5 w-3.5" />
          Stop Election
        </button>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/elections/${electionId}/results`}
          className={primary}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          View Results
        </Link>
        <button
          type="button"
          disabled={!!loading}
          className={secondary}
          onClick={downloadReport}
        >
          {spin("report")}
          <Download className="h-3.5 w-3.5" />
          Download Report
        </button>
      </div>
    );
  }

  return null;
}
