import type { SupabaseClient } from "@supabase/supabase-js";

import { getDashboardPathForRole, isUserRole } from "@/lib/auth";

export async function redirectToDashboard(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile?.role || !isUserRole(profile.role)) {
    return null;
  }

  return getDashboardPathForRole(profile.role);
}

export function getAuthCallbackUrl(next: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
