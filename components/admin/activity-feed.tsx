"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

import { AuditActionBadge } from "@/components/admin/audit-action-badge";
import type { AuditLogEntry } from "@/lib/audit/queries";

interface ActivityFeedProps {
  logs: AuditLogEntry[];
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">No recent activity.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {logs.map((log, index) => (
        <motion.li
          key={log.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-paper/50 px-4 py-3"
        >
          <AuditActionBadge action={log.action} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">
              <span className="font-medium">
                {log.user_email ?? "System"}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </p>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
