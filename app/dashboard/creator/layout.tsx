import type { ReactNode } from "react";

import { CreatorSidebar } from "@/components/creator/creator-sidebar";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTransition } from "@/components/dashboard/page-transition";
import { requireRole } from "@/lib/auth-server";

export default async function CreatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("election_creator");

  return (
    <DashboardShell sidebar={<CreatorSidebar />}>
      <PageTransition>{children}</PageTransition>
    </DashboardShell>
  );
}
