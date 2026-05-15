import { ElectionsTable } from "@/components/admin/elections-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireRole } from "@/lib/auth-server";
import { getAdminElectionsTable } from "@/lib/dashboard/admin-data";

export default async function AdminElectionsPage() {
  await requireRole("super_admin");
  const elections = await getAdminElectionsTable();

  return (
    <>
      <AdminPageHeader
        title="All Elections"
        description="Every election on the platform with voter counts and filters."
      />
      <ElectionsTable elections={elections} />
    </>
  );
}
