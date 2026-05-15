import { format } from "date-fns";
import { NextResponse } from "next/server";

import { auditLogsToCsv } from "@/lib/audit/csv";
import { fetchAllAuditLogsForExport } from "@/lib/audit/queries";
import type { AuditActionFilter } from "@/lib/audit/constants";
import { verifySuperAdmin } from "@/lib/admin/verify-admin";

const VALID_FILTERS = new Set([
  "all",
  "login",
  "vote_cast",
  "approval",
  "rejection",
  "voter_ids_generated",
  "election_created",
  "override",
]);

export async function GET(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const actionParam = searchParams.get("action") ?? "all";
  const actionFilter = VALID_FILTERS.has(actionParam)
    ? (actionParam as AuditActionFilter)
    : "all";

  try {
    const logs = await fetchAllAuditLogsForExport({
      actionFilter,
      dateFrom: searchParams.get("from"),
      dateTo: searchParams.get("to"),
      userSearch: searchParams.get("user"),
    });

    const csv = auditLogsToCsv(logs);
    const filename = `voteflow-audit-${format(new Date(), "yyyy-MM-dd")}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
