import { NextResponse } from "next/server";

import { authGuardResponse, requireAuth } from "@/lib/auth-guard";
import {
  notificationsPatchSchema,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/validations/core";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select(
        "id, type, title, message, link, election_id, read_at, sent_at"
      )
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .limit(Number.isNaN(limit) ? 20 : limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count: unreadCount, error: countError } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    return NextResponse.json({
      notifications: notifications ?? [],
      unreadCount: unreadCount ?? 0,
    });
  } catch (err) {
    const guarded = authGuardResponse(err);
    if (guarded) return guarded;
    const message = err instanceof Error ? err.message : "Failed to fetch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireAuth(request);
    const body = await parseJsonBody(request, notificationsPatchSchema);

    if (body.markAllRead) {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const validation = validationErrorResponse(err);
    if (validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const guarded = authGuardResponse(err);
    if (guarded) return guarded;
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
