import { format } from "date-fns";
import { NextResponse } from "next/server";

import {
  insertAuditLog,
  sendElectionEndEmail,
  sendElectionStartReminderEmail,
} from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase-admin";

function verifyCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  return runReminders(request);
}

export async function POST(request: Request) {
  return runReminders(request);
}

async function runReminders(request: Request) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  let startRemindersSent = 0;
  let endNotificationsSent = 0;
  const errors: string[] = [];

  const { data: upcomingElections } = await admin
    .from("elections")
    .select("id, title, start_time, end_time, status")
    .in("status", ["published", "active"])
    .is("start_reminder_sent_at", null)
    .gte("start_time", now.toISOString())
    .lte("start_time", oneHourLater.toISOString());

  for (const election of upcomingElections ?? []) {
    try {
      const { data: registrations } = await admin
        .from("voter_registrations")
        .select(
          `
          user_id,
          profile:profiles!user_id (email, name)
        `
        )
        .eq("election_id", election.id);

      const startLabel = election.start_time
        ? format(new Date(election.start_time), "MMM d, yyyy 'at' h:mm a")
        : "soon";

      for (const reg of registrations ?? []) {
        const profile = Array.isArray(reg.profile) ? reg.profile[0] : reg.profile;
        if (!profile?.email) continue;

        await sendElectionStartReminderEmail({
          to: profile.email,
          voterName: profile.name ?? "Voter",
          electionTitle: election.title,
          startTime: startLabel,
          electionId: election.id,
          userId: reg.user_id,
        });
        startRemindersSent += 1;
      }

      await admin
        .from("elections")
        .update({ start_reminder_sent_at: now.toISOString() })
        .eq("id", election.id);
    } catch (err) {
      errors.push(
        `Start reminder ${election.id}: ${err instanceof Error ? err.message : "failed"}`
      );
    }
  }

  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const { data: endedElections } = await admin
    .from("elections")
    .select("id, title, end_time, status")
    .in("status", ["active", "completed"])
    .is("end_notification_sent_at", null)
    .lte("end_time", now.toISOString())
    .gte("end_time", fiveMinutesAgo.toISOString());

  for (const election of endedElections ?? []) {
    try {
      const { data: registrations } = await admin
        .from("voter_registrations")
        .select(
          `
          user_id,
          profile:profiles!user_id (email, name)
        `
        )
        .eq("election_id", election.id);

      for (const reg of registrations ?? []) {
        const profile = Array.isArray(reg.profile) ? reg.profile[0] : reg.profile;
        if (!profile?.email) continue;

        await sendElectionEndEmail({
          to: profile.email,
          voterName: profile.name ?? "Voter",
          electionTitle: election.title,
          electionId: election.id,
          userId: reg.user_id,
        });
        endNotificationsSent += 1;
      }

      await admin
        .from("elections")
        .update({ end_notification_sent_at: now.toISOString() })
        .eq("id", election.id);
    } catch (err) {
      errors.push(
        `End notification ${election.id}: ${err instanceof Error ? err.message : "failed"}`
      );
    }
  }

  await insertAuditLog(null, "cron_election_reminders", {
    start_reminders_sent: startRemindersSent,
    end_notifications_sent: endNotificationsSent,
    errors: errors.length > 0 ? errors : undefined,
  });

  return NextResponse.json({
    success: true,
    start_reminders_sent: startRemindersSent,
    end_notifications_sent: endNotificationsSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
