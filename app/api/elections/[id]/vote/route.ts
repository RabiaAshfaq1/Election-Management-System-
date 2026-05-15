import { NextResponse } from "next/server";

import { authGuardResponse, requireAuth } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  parseJsonBody,
  validationErrorResponse,
  voteBodySchema,
} from "@/lib/validations/core";
import {
  getVoterRegistration,
  normalizeSecretId,
  secretIdsMatch,
} from "@/lib/voting/registration";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { supabase, user } = await requireAuth(request);
    const body = await parseJsonBody(request, voteBodySchema);
    const electionId = params.id;

    const registration = await getVoterRegistration(
      supabase,
      electionId,
      user.id
    );

    if (!registration) {
      return NextResponse.json(
        { error: "Not registered for this election" },
        { status: 403 }
      );
    }

    if (!secretIdsMatch(registration.secret_id, body.secretId)) {
      return NextResponse.json(
        { error: "Invalid secret voter ID" },
        { status: 403 }
      );
    }

    if (registration.has_voted) {
      return NextResponse.json(
        { error: "You have already voted in this election" },
        { status: 409 }
      );
    }

    const { data: election } = await supabase
      .from("elections")
      .select("status")
      .eq("id", electionId)
      .maybeSingle();

    if (!election || election.status !== "active") {
      return NextResponse.json(
        { error: "Election is not active" },
        { status: 400 }
      );
    }

    const secretId = normalizeSecretId(body.secretId);

    const { data: voteId, error: voteError } = await supabase.rpc("cast_vote", {
      p_secret_id: secretId,
      p_candidate_id: body.candidateId,
    });

    if (voteError) {
      const message = voteError.message.includes("Already voted")
        ? "You have already voted in this election"
        : voteError.message;

      return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
      const admin = createAdminClient();
      await admin.from("audit_logs").insert({
        user_id: user.id,
        action: "vote_cast",
        details: { election_id: electionId },
      });
    } catch {
      // Vote recorded; audit is best-effort
    }

    return NextResponse.json({ success: true, vote_id: voteId });
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
    const message = err instanceof Error ? err.message : "Vote failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
