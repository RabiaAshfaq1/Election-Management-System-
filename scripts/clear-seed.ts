import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

type SupabaseClient = any;

const USER_EMAILS = [
  "admin@voteflow.pk",
  "abdullah@comsats.edu.pk",
  "ahmed@techalliance.pk",
  ...Array.from({ length: 20 }, (_, index) => {
    return `voter${String(index + 1).padStart(2, "0")}@gmail.com`;
  }),
];

const ELECTION_TITLES = [
  "COMSATS Vehari Student Council 2025",
  "Pakistan Tech Alliance Board 2025",
  "Green Future Fund Leadership Vote",
];

function loadEnvFile(filename: string) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (process.env[key]) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function createSupabaseAdmin(): SupabaseClient {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as SupabaseClient;
}

async function listAuthUsers(supabase: SupabaseClient) {
  const users: any[] = [];
  let page = 1;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw new Error(`List auth users failed: ${error.message}`);
    users.push(...(data.users ?? []));
    if (!data.users || data.users.length < 1000) break;
    page += 1;
  }

  return users;
}

async function getSeededAuthUsers(supabase: SupabaseClient) {
  const users = await listAuthUsers(supabase);
  return users.filter((user) => user.email && USER_EMAILS.includes(user.email));
}

async function deleteRows(
  supabase: SupabaseClient,
  table: string,
  column: string,
  values: string[]
) {
  if (values.length === 0) return;
  const { error } = await supabase.from(table).delete().in(column, values);
  if (error) throw new Error(`Delete ${table} failed: ${error.message}`);
}

async function clearSeededData() {
  const supabase = createSupabaseAdmin();

  console.log("Finding VoteFlow demo seed data...");
  const seededAuthUsers = await getSeededAuthUsers(supabase);
  const userIds = seededAuthUsers.map((user) => user.id);

  const { data: elections, error: electionsError } = await supabase
    .from("elections")
    .select("id")
    .in("title", ELECTION_TITLES);

  if (electionsError) {
    throw new Error(`Fetch seeded elections failed: ${electionsError.message}`);
  }

  const electionIds = (elections ?? []).map((election: { id: string }) => {
    return election.id;
  });

  console.log("Deleting votes...");
  await deleteRows(supabase, "votes", "election_id", electionIds);

  console.log("Deleting voter registrations...");
  await deleteRows(supabase, "voter_registrations", "election_id", electionIds);

  console.log("Deleting candidates...");
  await deleteRows(supabase, "candidates", "election_id", electionIds);

  console.log("Deleting elections...");
  await deleteRows(supabase, "elections", "id", electionIds);

  console.log("Deleting election requests...");
  await deleteRows(supabase, "election_requests", "creator_id", userIds);

  console.log("Deleting audit logs...");
  await deleteRows(supabase, "audit_logs", "user_id", userIds);

  console.log("Deleting profiles...");
  await deleteRows(supabase, "profiles", "id", userIds);

  console.log("Deleting auth users...");
  for (const userId of userIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error && !error.message.toLowerCase().includes("not found")) {
      throw new Error(`Delete auth user failed: ${error.message}`);
    }
  }

  console.log("VoteFlow demo seed data cleared.");
}

clearSeededData().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
