import { NextResponse } from "next/server";

import { authGuardResponse, requireAuth } from "@/lib/auth-guard";
import { uuidSchema } from "@/lib/validations/core";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const parsed = uuidSchema.safeParse(params.id);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    const { supabase, user } = await requireAuth(_request);

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", parsed.data)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const guarded = authGuardResponse(err);
    if (guarded) return guarded;
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
