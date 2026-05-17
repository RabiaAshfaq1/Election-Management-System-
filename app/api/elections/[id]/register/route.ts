import { NextResponse } from "next/server";

import { authGuardResponse, requireAuth } from "@/lib/auth-guard";
import {
  canRegisterForElection,
  isRegistrationDeadlineOpen,
} from "@/lib/elections/status";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  parseJsonBody,
  registerElectionBodySchema,
  validationErrorResponse,
} from "@/lib/validations/core";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { supabase, user } = await requireAuth(request);
    const body = await parseJsonBody(request, registerElectionBodySchema);
    const electionId = params.id;

    if (!body.acceptTerms) {
      return NextResponse.json(
        { error: "You must accept the terms to register." },
        { status: 400 }
      );
    }

    const { data: election, error: electionError } = await supabase
      .from("elections")
      .select(
        "id, title, status, start_time, end_time, registration_deadline, max_voters"
      )
      .eq("id", electionId)
      .in("status", ["published", "active"])
      .maybeSingle();

    if (electionError || !election) {
      return NextResponse.json(
        { error: "Election not found or not open for registration." },
        { status: 404 }
      );
    }

    const { data: existing } = await supabase
      .from("voter_registrations")
      .select("id")
      .eq("election_id", electionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
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
        { error: "Unable to verify capacity. Try again later." },
        { status: 503 }
      );
    }

    const electionWithCount = {
      ...election,
      voter_count: voterCount,
      registrations_locked: voterCount >= election.max_voters,
    };

    if (!isRegistrationDeadlineOpen(electionWithCount)) {
      return NextResponse.json(
        { error: "Registration deadline has passed." },
        { status: 400 }
      );
    }

    if (!canRegisterForElection(electionWithCount)) {
      return NextResponse.json(
        { error: "Registration is closed — this election is full." },
        { status: 400 }
      );
    }

    const { data: registration, error: insertError } = await supabase
      .from("voter_registrations")
      .insert({
        election_id: electionId,
        user_id: user.id,
      })
      .select("id, registered_at")
      .single();

    if (insertError) {
      const message = insertError.message.includes("duplicate")
        ? "You are already registered for this election."
        : insertError.message;

      return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
      const admin = createAdminClient();

      await admin.from("audit_logs").insert({
        user_id: user.id,
        action: "voter_registered",
        details: {
          election_id: electionId,
          election_title: election.title,
          registration_id: registration.id,
        },
      });

      const newCount = voterCount + 1;

      if (newCount >= election.max_voters) {
        await admin
          .from("elections")
          .update({ registrations_locked: true })
          .eq("id", electionId);

        await admin.from("audit_logs").insert({
          user_id: user.id,
          action: "election_registrations_locked",
          details: {
            election_id: electionId,
            voter_count: newCount,
            max_voters: election.max_voters,
          },
        });
      }
    } catch {
      // Registration succeeded; audit/lock are best-effort.
    }

    return NextResponse.json(
      {
        registration: {
          id: registration.id,
          registered_at: registration.registered_at,
        },
        voter_count: voterCount + 1,
      },
      { status: 201 }
    );
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
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
