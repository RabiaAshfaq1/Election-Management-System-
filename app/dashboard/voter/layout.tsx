import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTransition } from "@/components/dashboard/page-transition";
import { VoterSidebar } from "@/components/voter/voter-sidebar";
import { requireRole } from "@/lib/auth-server";

export default async function VoterLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("voter");

  return (
    <DashboardShell sidebar={<VoterSidebar />}>
      <PageTransition>{children}</PageTransition>
    </DashboardShell>
  );
}
