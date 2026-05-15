import { UsersTable } from "@/components/admin/users-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireRole } from "@/lib/auth-server";
import { getAdminUsersTable } from "@/lib/dashboard/admin-data";

export default async function AdminUsersPage() {
  await requireRole("super_admin");
  const users = await getAdminUsersTable();

  return (
    <>
      <AdminPageHeader
        title="All Users"
        description="Registered users across all roles."
      />
      <UsersTable users={users} />
    </>
  );
}
