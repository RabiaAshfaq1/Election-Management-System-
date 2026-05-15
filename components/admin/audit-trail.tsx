"use client";

import { format } from "date-fns";
import { ChevronDown, ChevronRight, Download, Loader2 } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { AuditActionBadge } from "@/components/admin/audit-action-badge";
import {
  AUDIT_FILTER_OPTIONS,
  PAGE_SIZE,
  type AuditActionFilter,
} from "@/lib/audit/constants";
import type { AuditLogEntry, AuditLogQueryResult } from "@/lib/audit/queries";

interface AuditTrailProps {
  initialData: AuditLogQueryResult;
}

export function AuditTrail({ initialData }: AuditTrailProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [actionFilter, setActionFilter] = useState<AuditActionFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);

  const skipFilterEffect = useRef(true);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  const buildQuery = useCallback(
    (targetPage: number, includePage = true) => {
      const params = new URLSearchParams();
      if (includePage) params.set("page", String(targetPage));
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (userSearch.trim()) params.set("user", userSearch.trim());
      return params.toString();
    },
    [actionFilter, dateFrom, dateTo, userSearch]
  );

  const loadLogs = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/audit?${buildQuery(targetPage)}`);
        if (res.ok) {
          const json = (await res.json()) as AuditLogQueryResult;
          setData(json);
          setPage(targetPage);
        }
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  useEffect(() => {
    if (skipFilterEffect.current) {
      skipFilterEffect.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      loadLogs(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [actionFilter, dateFrom, dateTo, userSearch, loadLogs]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/admin/audit/export?${buildQuery(1, false)}`
      );
      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "voteflow-audit.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function formatDetailsSummary(log: AuditLogEntry): string {
    if (!log.details) return "—";
    const keys = Object.keys(log.details);
    if (keys.length === 0) return "—";
    return keys.slice(0, 3).join(", ") + (keys.length > 3 ? "…" : "");
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-ink">Audit Trail</h1>
          <p className="mt-1 text-sm text-muted">
            Immutable log of administrative and voting events
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download CSV
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Action
          </label>
          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value as AuditActionFilter)
            }
            className="rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          >
            {AUDIT_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            User email
          </label>
          <input
            type="search"
            placeholder="Search by email…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <Loader2 className="h-8 w-8 animate-spin text-teal" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-paper/60">
                <th className="w-8 px-3 py-3.5" />
                <th className="px-4 py-3.5 font-semibold text-ink">Timestamp</th>
                <th className="px-4 py-3.5 font-semibold text-ink">User Email</th>
                <th className="px-4 py-3.5 font-semibold text-ink">Action</th>
                <th className="px-4 py-3.5 font-semibold text-ink">Details</th>
                <th className="px-4 py-3.5 font-semibold text-ink">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.logs.map((log) => {
                const expanded = expandedId === log.id;
                return (
                  <Fragment key={log.id}>
                    <tr
                      className="cursor-pointer hover:bg-paper/50"
                      onClick={() =>
                        setExpandedId(expanded ? null : log.id)
                      }
                    >
                      <td className="px-3 py-4 text-muted">
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-muted">
                        {format(
                          new Date(log.created_at),
                          "MMM d, yyyy h:mm:ss a"
                        )}
                      </td>
                      <td className="px-4 py-4 text-ink">
                        {log.user_email ?? "System"}
                      </td>
                      <td className="px-4 py-4">
                        <AuditActionBadge action={log.action} />
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-4 text-muted">
                        {formatDetailsSummary(log)}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-muted">
                        {log.ip_address ?? "—"}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-paper/40">
                        <td colSpan={6} className="px-6 py-4">
                          <pre className="overflow-x-auto rounded-xl border border-border bg-white p-4 font-mono text-xs text-ink">
                            {JSON.stringify(log.details, null, 2) ?? "null"}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.logs.length === 0 && !loading && (
          <p className="px-5 py-12 text-center text-sm text-muted">
            No audit logs match your filters.
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <p className="text-sm text-muted">
            {data.total.toLocaleString()} total · Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => loadLogs(page - 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => loadLogs(page + 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
