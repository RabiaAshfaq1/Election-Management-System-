import { AuthGuardError, requireRole } from "@/lib/auth-guard";

export async function verifySuperAdmin() {
  try {
    const session = await requireRole(undefined, "super_admin");
    return { ok: true as const, supabase: session.supabase, user: session.user };
  } catch (err) {
    if (err instanceof AuthGuardError) {
      return {
        ok: false as const,
        error: err.message,
        status: err.status,
      };
    }
    return { ok: false as const, error: "Forbidden", status: 403 as const };
  }
}
