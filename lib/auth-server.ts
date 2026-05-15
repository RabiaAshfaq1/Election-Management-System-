import { redirect } from "next/navigation";

import { getDashboardPathForRole, getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type { UserRole } from "@/lib/types";

export async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const role = await getUserRole(supabase, user);

  if (!role) {
    redirect("/auth/login?error=missing_role");
  }

  return { supabase, user, role };
}

export async function requireRole(allowedRole: UserRole) {
  const session = await requireAuth();

  if (session.role !== allowedRole) {
    redirect(getDashboardPathForRole(session.role));
  }

  return session;
}

export async function getOptionalAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const role = await getUserRole(supabase, user);

  if (!role) {
    return null;
  }

  return { supabase, user, role };
}
