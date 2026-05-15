"use client";

import { format } from "date-fns";
import { ClipboardX, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  approveElectionRequest,
  rejectElectionRequest,
} from "@/app/dashboard/admin/requests/actions";
import { RejectModal } from "@/components/admin/reject-modal";

export interface PendingRequest {
  id: string;
  organization: string;
  purpose: string;
  email: string | null;
  created_at: string;
  creator: {
    name: string;
    email: string;
  } | null;
}

interface RequestsTableProps {
  requests: PendingRequest[];
}

export function RequestsTable({ requests }: RequestsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingRequest | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const result = await approveElectionRequest(id);
    setLoadingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Request approved and creator notified");
    router.refresh();
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;

    setLoadingId(rejectTarget.id);
    const result = await rejectElectionRequest(rejectTarget.id, reason);
    setLoadingId(null);
    setRejectTarget(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Request rejected and creator notified");
    router.refresh();
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-8 py-20 text-center shadow-card">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
          <ClipboardX className="h-8 w-8 text-teal" strokeWidth={1.75} />
        </div>
        <h3 className="font-heading text-xl font-bold text-ink">
          No pending requests
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          When election creators submit access requests, they will appear here
          for your review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-paper/60">
                <th className="px-5 py-3.5 font-semibold text-ink">
                  Organization
                </th>
                <th className="px-5 py-3.5 font-semibold text-ink">
                  Creator Name
                </th>
                <th className="px-5 py-3.5 font-semibold text-ink">Email</th>
                <th className="px-5 py-3.5 font-semibold text-ink">Purpose</th>
                <th className="px-5 py-3.5 font-semibold text-ink">
                  Submitted
                </th>
                <th className="px-5 py-3.5 font-semibold text-ink">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((request) => {
                const isLoading = loadingId === request.id;
                const creatorEmail =
                  request.email ?? request.creator?.email ?? "—";

                return (
                  <tr key={request.id} className="hover:bg-paper/40">
                    <td className="px-5 py-4 font-medium text-ink">
                      {request.organization}
                    </td>
                    <td className="px-5 py-4 text-ink">
                      {request.creator?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-muted">{creatorEmail}</td>
                    <td className="max-w-[200px] truncate px-5 py-4 text-muted">
                      {request.purpose}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleApprove(request.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-teal-light disabled:opacity-60"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setRejectTarget(request)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/15 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RejectModal
        open={!!rejectTarget}
        organization={rejectTarget?.organization ?? ""}
        loading={!!rejectTarget && loadingId === rejectTarget.id}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </>
  );
}
