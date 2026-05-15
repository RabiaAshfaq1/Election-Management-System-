import { format } from "date-fns";

import type { AuditLogEntry } from "@/lib/audit/queries";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function auditLogsToCsv(logs: AuditLogEntry[]): string {
  const headers = ["Timestamp", "User Email", "Action", "Details", "IP"];
  const rows = logs.map((log) => [
    format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
    log.user_email ?? "",
    log.action,
    log.details ? JSON.stringify(log.details) : "",
    log.ip_address ?? "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
    .join("\n");
}
