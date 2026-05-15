"use client";

import Link from "next/link";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { ElectionsChart } from "@/components/admin/elections-chart";
import { StatsGrid } from "@/components/admin/stats-grid";
import type { AuditLogEntry } from "@/lib/audit/queries";

interface AdminOverviewPanelProps {
  stats: {
    totalElections: number;
    activeElections: number;
    totalUsers: number;
    pendingRequests: number;
  };
  chartData: { month: string; elections: number }[];
  recentActivity: AuditLogEntry[];
}

export function AdminOverviewPanel({
  stats,
  chartData,
  recentActivity,
}: AdminOverviewPanelProps) {
  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-card lg:col-span-3">
          <h2 className="font-heading text-lg font-bold text-ink">
            Elections by month
          </h2>
          <p className="mt-1 text-sm text-muted">New elections created (last 6 months)</p>
          <div className="mt-6">
            <ElectionsChart data={chartData} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-ink">
              Recent activity
            </h2>
            <Link
              href="/dashboard/admin/audit"
              className="text-xs font-semibold text-teal hover:text-teal-light"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 max-h-80 overflow-y-auto">
            <ActivityFeed logs={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
