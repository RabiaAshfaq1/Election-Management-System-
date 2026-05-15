import { NextResponse } from "next/server";

import { getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type { UserRole } from "@/lib/types";

export class AuthGuardError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.status = status;
  }
}

export interface AuthSession {
  supabase: ReturnType<typeof createClient>;
  user: { id: string; email?: string };
  role: UserRole;
}

/**
 * Returns the authenticated session or throws AuthGuardError (401).
 */
export async function requireAuth(_request?: Request): Promise<AuthSession> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthGuardError(401, "Unauthorized");
  }

  const role = await getUserRole(supabase, user);

  if (!role) {
    throw new AuthGuardError(401, "Unauthorized");
  }

  return { supabase, user, role };
}

/**
 * Returns session only if user has the required role, else throws 403.
 */
export async function requireRole(
  _request: Request | undefined,
  allowedRole: UserRole
): Promise<AuthSession> {
  const session = await requireAuth(_request);

  if (session.role !== allowedRole) {
    throw new AuthGuardError(403, "Forbidden");
  }

  return session;
}

export function authGuardResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthGuardError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}

export function handleApiError(error: unknown): NextResponse {
  const guarded = authGuardResponse(error);
  if (guarded) return guarded;

  const message = error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json({ error: message }, { status: 500 });
}
