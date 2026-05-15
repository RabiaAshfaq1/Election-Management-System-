import { format } from "date-fns";
import { NextResponse } from "next/server";

import { insertAuditLog, sendSecretIdEmail } from "@/lib/email/send";
import { verifyElectionManager } from "@/lib/elections/verify-manager";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  generateSecretId,
  getNextSequenceNumber,
  isPollSecretId,
} from "@/lib/secret-id";

interface RouteContext {
  params: { id: string };
}

interface RegistrationRow {
  id: string;
  user_id: string;
  secret_id: string;
  profile: { name: string; email: string } | { name: string; email: string }[] | null;
}

function formatElectionStart(startTime: string | null): string {
  if (!startTime) return "To be announced";
  return format(new Date(startTime), "EEEE, MMMM d, yyyy 'at' h:mm a");
}

function getProfile(
  profile: RegistrationRow["profile"]
): { name: string; email: string } | null {
  if (!profile) return null;
  return Array.isArray(profile) ? profile[0] ?? null : profile;
}

export async function POST(_request: Request, { params }: RouteContext) {
  const electionId = params.id;

  const auth = await verifyElectionManager(electionId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminClient();
  const election = auth.election;

  const { data: registrations, error: fetchError } = await admin
    .from("voter_registrations")
    .select(
      `
      id,
      user_id,
      secret_id,
      profile:profiles!user_id (name, email)
    `
    )
    .eq("election_id", electionId);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const rows = (registrations ?? []) as RegistrationRow[];
  const pending = rows.filter((row) => !isPollSecretId(row.secret_id));

  if (pending.length === 0) {
    return NextResponse.json({
      generated: 0,
      emailed: 0,
      message: "All voters already have finalized secret IDs.",
    });
  }

  const { data: allSecretRows } = await admin
    .from("voter_registrations")
    .select("secret_id");

  const existingIds = (allSecretRows ?? []).map((r) => r.secret_id as string);

  const meta = { title: election.title, category: election.category };
  let sequence = getNextSequenceNumber(existingIds, electionId, meta);

  const startTimeLabel = formatElectionStart(election.start_time);
  const generated: {
    registrationId: string;
    userId: string;
    secretId: string;
    email: string;
    name: string;
  }[] = [];
  const emailErrors: string[] = [];
  let emailed = 0;

  for (const row of pending) {
    const profile = getProfile(row.profile);
    if (!profile?.email) {
      emailErrors.push(`Registration ${row.id}: missing voter email`);
      continue;
    }

    let secretId = generateSecretId(electionId, sequence, meta);
    sequence += 1;

    let attempts = 0;
    while (attempts < 20) {
      const { data: conflict } = await admin
        .from("voter_registrations")
        .select("id")
        .eq("secret_id", secretId)
        .maybeSingle();

      if (!conflict) break;
      secretId = generateSecretId(electionId, sequence, meta);
      sequence += 1;
      attempts += 1;
    }

    const { error: updateError } = await admin
      .from("voter_registrations")
      .update({ secret_id: secretId })
      .eq("id", row.id);

    if (updateError) {
      emailErrors.push(`Registration ${row.id}: ${updateError.message}`);
      continue;
    }

    generated.push({
      registrationId: row.id,
      userId: row.user_id,
      secretId,
      email: profile.email,
      name: profile.name,
    });
  }

  for (const item of generated) {
    try {
      await sendSecretIdEmail({
        to: item.email,
        voterName: item.name,
        electionTitle: election.title,
        secretId: item.secretId,
        startTime: startTimeLabel,
        electionId,
        userId: item.userId,
      });
      emailed += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Email failed";
      emailErrors.push(`${item.email}: ${message}`);
    }
  }

  try {
    await insertAuditLog(auth.user.id, "voter_ids_generated", {
      election_id: electionId,
      election_title: election.title,
      generated_count: generated.length,
      emailed_count: emailed,
    });
  } catch {
    // audit is best-effort
  }

  return NextResponse.json({
    generated: generated.length,
    emailed,
    email_errors: emailErrors.length > 0 ? emailErrors : undefined,
  });
}
