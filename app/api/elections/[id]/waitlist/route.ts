import { NextResponse } from "next/server";

import { authGuardResponse, requireAuth } from "@/lib/auth-guard";
import { isElectionFull } from "@/lib/elections/status";
import { createAdminClient } from "@/lib/supabase-admin";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const electionId = params.id;

    const { supabase, user } = await requireAuth(request);

    const { data: election, error: electionError } = await supabase
      .from("elections")
      .select(
        "id, title, status, start_time, end_time, registration_deadline, max_voters"
      )
      .eq("id", electionId)
      .in("status", ["published", "active"])
      .maybeSingle();

    if (electionError || !election) {
      return NextResponse.json({ error: "Election not found." }, { status: 404 });
    }

    const { data: existingRegistration } = await supabase
      .from("voter_registrations")
      .select("id")
      .eq("election_id", electionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You are already registered for this election." },
        { status: 409 }
      );
    }

    let voterCount = 0;

    try {
      const admin = createAdminClient();
      const { count } = await admin
        .from("voter_registrations")
        .select("*", { count: "exact", head: true })
        .eq("election_id", electionId);

      voterCount = count ?? 0;
    } catch {
      return NextResponse.json(
        { error: "Unable to verify election capacity." },
        { status: 503 }
      );
    }

    const electionWithCount = {
      ...election,
      voter_count: voterCount,
      registrations_locked: voterCount >= election.max_voters,
    };

    if (!isElectionFull(electionWithCount)) {
      return NextResponse.json(
        { error: "Spots are still available — register instead." },
        { status: 400 }
      );
    }

    const { error: waitlistError } = await supabase
      .from("election_waitlist")
      .insert({
        election_id: electionId,
        user_id: user.id,
      });

    if (waitlistError) {
      if (waitlistError.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "You are already on the waitlist." },
          { status: 409 }
        );
      }

      if (
        waitlistError.message.includes("election_waitlist") ||
        waitlistError.code === "42P01"
      ) {
        return NextResponse.json(
          {
            error:
              "Waitlist is not enabled yet. Run supabase/election-registration.sql in Supabase.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ error: waitlistError.message }, { status: 400 });
    }

    try {
      const admin = createAdminClient();
      await admin.from("audit_logs").insert({
        user_id: user.id,
        action: "election_waitlist_joined",
        details: {
          election_id: electionId,
          election_title: election.title,
        },
      });
    } catch {
      // Best-effort audit.
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    const guarded = authGuardResponse(err);
    if (guarded) return guarded;
    const message = err instanceof Error ? err.message : "Waitlist failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
