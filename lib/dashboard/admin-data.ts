// SERVER ONLY — never import in client components

import { createAdminClient } from "@/lib/supabase-admin";
import { fetchAuditLogs } from "@/lib/audit/queries";

export async function getAdminOverviewData() {
  const admin = createAdminClient();

  const [
    { count: totalElections },
    { count: activeElections },
    { count: totalUsers },
    { count: pendingRequests },
    { data: elections },
    auditResult,
  ] = await Promise.all([
    admin.from("elections").select("*", { count: "exact", head: true }),
    admin
      .from("elections")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin
      .from("election_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    admin.from("elections").select("created_at"),
    fetchAuditLogs({ page: 1, pageSize: 8 }),
  ]);

  const byMonth = new Map<string, number>();
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, 0);
  }

  for (const row of elections ?? []) {
    const created = new Date(row.created_at);
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
    if (byMonth.has(key)) {
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
  }

  const chartData = Array.from(byMonth.entries()).map(([month, count]) => {
    const [year, m] = month.split("-");
    const label = new Date(Number(year), Number(m) - 1, 1).toLocaleDateString(
      "en-US",
      { month: "short" }
    );
    return { month: label, elections: count };
  });

  return {
    stats: {
      totalElections: totalElections ?? 0,
      activeElections: activeElections ?? 0,
      totalUsers: totalUsers ?? 0,
      pendingRequests: pendingRequests ?? 0,
    },
    chartData,
    recentActivity: auditResult.logs,
  };
}

export async function getAdminElectionsTable() {
  const admin = createAdminClient();

  const { data: elections, error } = await admin
    .from("elections")
    .select(
      `
      id,
      title,
      status,
      start_time,
      created_at,
      creator:profiles!creator_id (name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const ids = (elections ?? []).map((e) => e.id);
  const voterCounts: Record<string, number> = {};

  if (ids.length > 0) {
    const { data: regs } = await admin
      .from("voter_registrations")
      .select("election_id")
      .in("election_id", ids);

    for (const r of regs ?? []) {
      voterCounts[r.election_id] = (voterCounts[r.election_id] ?? 0) + 1;
    }
  }

  return (elections ?? []).map((e) => {
    const creator = Array.isArray(e.creator) ? e.creator[0] : e.creator;
    return {
      id: e.id,
      title: e.title,
      status: e.status,
      start_time: e.start_time,
      created_at: e.created_at,
      creator_name: creator?.name ?? "—",
      creator_email: creator?.email ?? "",
      voter_count: voterCounts[e.id] ?? 0,
    };
  });
}

export async function getAdminUsersTable() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}
