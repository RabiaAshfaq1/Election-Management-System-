"use client";

import { BarChart3, LayoutDashboard, Vote } from "lucide-react";

import { SidebarNav, type NavItem } from "@/components/dashboard/sidebar-nav";
import { NotificationBell } from "@/components/voter/notification-bell";

const navItems: NavItem[] = [
  { href: "/dashboard/voter", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/voter/elections", label: "My Elections", icon: Vote },
  { href: "/dashboard/voter/results", label: "Results", icon: BarChart3 },
];

export function VoterSidebar() {
  return (
    <SidebarNav
      items={navItems}
      homeHref="/dashboard/voter"
      subtitle="Voter"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Notifications</span>
          <NotificationBell />
        </div>
      }
    />
  );
}
