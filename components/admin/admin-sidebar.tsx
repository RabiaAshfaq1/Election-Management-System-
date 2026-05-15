"use client";

import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Vote,
} from "lucide-react";

import { SidebarNav, type NavItem } from "@/components/dashboard/sidebar-nav";

const navItems: NavItem[] = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/dashboard/admin/elections", label: "All Elections", icon: Vote },
  { href: "/dashboard/admin/users", label: "All Users", icon: Users },
  { href: "/dashboard/admin/audit", label: "Audit Logs", icon: FileText },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  return (
    <SidebarNav
      items={navItems}
      homeHref="/dashboard/admin"
      subtitle="Super Admin"
    />
  );
}
