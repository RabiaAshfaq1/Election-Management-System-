import { AdminOverviewPanel } from "@/components/admin/admin-overview-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireRole } from "@/lib/auth-server";
import { getAdminOverviewData } from "@/lib/dashboard/admin-data";

export default async function AdminOverviewPage() {
  await requireRole("super_admin");
  const { stats, chartData, recentActivity } = await getAdminOverviewData();

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Platform-wide metrics and activity at a glance."
      />
      <AdminOverviewPanel
        stats={stats}
        chartData={chartData}
        recentActivity={recentActivity}
      />
    </>
  );
}
