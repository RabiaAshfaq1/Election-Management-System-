import { NextResponse } from "next/server";

import { authGuardResponse, requireAuth } from "@/lib/auth-guard";
import {
  parseJsonBody,
  validationErrorResponse,
  verifySecretIdBodySchema,
} from "@/lib/validations/core";
import {
  getVoterRegistration,
  secretIdsMatch,
} from "@/lib/voting/registration";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { supabase, user } = await requireAuth(request);
    const body = await parseJsonBody(request, verifySecretIdBodySchema);
    const electionId = params.id;

    const registration = await getVoterRegistration(
      supabase,
      electionId,
      user.id
    );

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Not registered for this election" },
        { status: 403 }
      );
    }

    const { data: election } = await supabase
      .from("elections")
      .select("status")
      .eq("id", electionId)
      .maybeSingle();

    if (!election || election.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Election is not active" },
        { status: 400 }
      );
    }

    if (registration.has_voted) {
      return NextResponse.json(
        { success: false, error: "You have already voted" },
        { status: 400 }
      );
    }

    const success = secretIdsMatch(registration.secret_id, body.secretId);

    return NextResponse.json({ success });
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
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
