import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { UserRole } from "@/lib/types";

const VALID_ROLES: UserRole[] = [
  "super_admin",
  "election_creator",
  "voter",
];

export function isUserRole(value: string | null | undefined): value is UserRole {
  return VALID_ROLES.includes(value as UserRole);
}

export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/dashboard/admin";
    case "election_creator":
      return "/dashboard/creator";
    case "voter":
      return "/dashboard/voter";
  }
}

export async function getUserRole(
  supabase: SupabaseClient,
  user: User
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data?.role || !isUserRole(data.role)) {
    return null;
  }

  return data.role;
}
