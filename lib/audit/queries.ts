// SERVER ONLY — never import in client components

import { createAdminClient } from "@/lib/supabase-admin";
import {
  getActionsForFilter,
  PAGE_SIZE,
  type AuditActionFilter,
} from "@/lib/audit/constants";

export interface AuditLogEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
}

export interface AuditLogQueryParams {
  page?: number;
  pageSize?: number;
  actionFilter?: AuditActionFilter;
  dateFrom?: string | null;
  dateTo?: string | null;
  userSearch?: string | null;
}

export interface AuditLogQueryResult {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

function extractIp(details: Record<string, unknown> | null): string | null {
  if (!details) return null;
  const ip = details.ip ?? details.ip_address ?? details.client_ip;
  return typeof ip === "string" ? ip : null;
}

function mapRow(row: {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
  user: { email: string } | { email: string }[] | null;
}): AuditLogEntry {
  const user = Array.isArray(row.user) ? row.user[0] : row.user;
  return {
    id: row.id,
    action: row.action,
    details: row.details,
    created_at: row.created_at,
    user_id: row.user_id,
    user_email: user?.email ?? null,
    ip_address: extractIp(row.details),
  };
}

export async function fetchAuditLogs(
  params: AuditLogQueryParams
): Promise<AuditLogQueryResult> {
  const admin = createAdminClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let userIds: string[] | null = null;

  if (params.userSearch?.trim()) {
    const term = params.userSearch.trim();
    const { data: profiles } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", `%${term}%`);

    userIds = (profiles ?? []).map((p) => p.id);
    if (userIds.length === 0) {
      return { logs: [], total: 0, page, pageSize };
    }
  }

  let query = admin
    .from("audit_logs")
    .select(
      `
      id,
      action,
      details,
      created_at,
      user_id,
      user:profiles!user_id (email)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  const actions = getActionsForFilter(params.actionFilter ?? "all");
  if (actions) {
    query = query.in("action", actions);
  }

  if (params.dateFrom) {
    query = query.gte("created_at", `${params.dateFrom}T00:00:00.000Z`);
  }

  if (params.dateTo) {
    query = query.lte("created_at", `${params.dateTo}T23:59:59.999Z`);
  }

  if (userIds) {
    query = query.in("user_id", userIds);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    logs: (data ?? []).map((row) =>
      mapRow(
        row as Parameters<typeof mapRow>[0]
      )
    ),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function fetchAllAuditLogsForExport(
  params: Omit<AuditLogQueryParams, "page" | "pageSize">
): Promise<AuditLogEntry[]> {
  const all: AuditLogEntry[] = [];
  let page = 1;
  const pageSize = 500;

  while (true) {
    const batch = await fetchAuditLogs({ ...params, page, pageSize });
    all.push(...batch.logs);
    if (all.length >= batch.total || batch.logs.length < pageSize) {
      break;
    }
    page += 1;
  }

  return all;
}
