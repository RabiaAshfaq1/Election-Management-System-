import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTransition } from "@/components/dashboard/page-transition";
import { requireRole } from "@/lib/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("super_admin");

  return (
    <DashboardShell sidebar={<AdminSidebar />}>
      <PageTransition>{children}</PageTransition>
    </DashboardShell>
  );
}
