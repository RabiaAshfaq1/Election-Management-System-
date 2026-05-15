"use client";

import { BarChart3, LayoutDashboard, PlusCircle, Vote } from "lucide-react";

import { SidebarNav, type NavItem } from "@/components/dashboard/sidebar-nav";

const navItems: NavItem[] = [
  { href: "/dashboard/creator", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/creator/elections", label: "My Elections", icon: Vote },
  { href: "/dashboard/creator/create", label: "Create New", icon: PlusCircle },
  { href: "/dashboard/creator/results", label: "Results", icon: BarChart3 },
];

export function CreatorSidebar() {
  return (
    <SidebarNav
      items={navItems}
      homeHref="/dashboard/creator"
      subtitle="Election Creator"
    />
  );
}
