import { NextResponse } from "next/server";

import { fetchAuditLogs } from "@/lib/audit/queries";
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
  const page = Number(searchParams.get("page") ?? "1");
  const actionParam = searchParams.get("action") ?? "all";
  const actionFilter = VALID_FILTERS.has(actionParam)
    ? (actionParam as AuditActionFilter)
    : "all";

  try {
    const result = await fetchAuditLogs({
      page: Number.isNaN(page) ? 1 : page,
      actionFilter,
      dateFrom: searchParams.get("from"),
      dateTo: searchParams.get("to"),
      userSearch: searchParams.get("user"),
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
