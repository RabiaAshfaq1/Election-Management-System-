import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

type Role = "super_admin" | "election_creator" | "voter";

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: Role;
  is_approved: boolean;
};

type SeedCandidate = {
  name: string;
  designation: string;
  manifesto: string;
  photo_url: string;
};

type SeedElection = {
  key: "comsats" | "tech" | "green";
  title: string;
  creatorEmail: string;
  category: string;
  description: string;
  status: "active" | "published" | "completed";
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_voters: number;
  candidates: SeedCandidate[];
};

type SupabaseClient = any;

const USER_EMAILS = [
  "admin@voteflow.pk",
  "abdullah@comsats.edu.pk",
  "ahmed@techalliance.pk",
  ...Array.from({ length: 20 }, (_, index) => {
    return `voter${String(index + 1).padStart(2, "0")}@gmail.com`;
  }),
];

const VOTER_NAMES = [
  "Ayesha Siddiqui",
  "Bilal Chaudhry",
  "Fatima Malik",
  "Usman Tariq",
  "Hira Baig",
  "Zain ul Abideen",
  "Mahnoor Akhtar",
  "Saad Farooqi",
  "Nimra Hassan",
  "Talha Mehmood",
  "Sobia Naz",
  "Hamza Sheikh",
  "Aroha Iqbal",
  "Fawad Anwar",
  "Laiba Qureshi",
  "Asad Javed",
  "Misbah Yousaf",
  "Rayan Shahid",
  "Zara Naseem",
  "Khurram Abbas",
];

const BASE_USERS: SeedUser[] = [
  {
    email: "admin@voteflow.pk",
    password: "Admin1234!",
    name: "Rabia Ashfaq",
    role: "super_admin",
    is_approved: true,
  },
  {
    email: "abdullah@comsats.edu.pk",
    password: "Creator1234!",
    name: "Dr. Abdullah Khan",
    role: "election_creator",
    is_approved: true,
  },
  {
    email: "ahmed@techalliance.pk",
    password: "Creator1234!",
    name: "Ahmed Raza",
    role: "election_creator",
    is_approved: true,
  },
];

const VOTERS: SeedUser[] = VOTER_NAMES.map((name, index) => ({
  email: `voter${String(index + 1).padStart(2, "0")}@gmail.com`,
  password: "Voter1234!",
  name,
  role: "voter",
  is_approved: false,
}));

const DEMO_USERS = [...BASE_USERS, ...VOTERS];

const PLACEHOLDER_PHOTOS = {
  sara:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=b6e3f4",
  bilal:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Bilal&backgroundColor=c0aede",
  zara:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Zara&backgroundColor=d1f4e0",
  faisal:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Faisal&backgroundColor=ffd5dc",
  nadia:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Nadia&backgroundColor=ffdfbf",
  imran:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Imran&backgroundColor=b6e3f4",
  hassan:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Hassan&backgroundColor=c0aede",
  sana:
    "https://api.dicebear.com/7.x/notionists/svg?seed=Sana&backgroundColor=d1f4e0",
};

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

function addTime(amount: number, unit: "hours" | "days") {
  const multiplier = unit === "hours" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + amount * multiplier).toISOString();
}

function makeSecretId(prefix: "POLL-CS25" | "POLL-GF24", index: number) {
  return `${prefix}-${String(index).padStart(4, "0")}`;
}

async function requireNoError(
  result: { data: any; error: Error | null },
  message: string
) {
  if (result.error) throw new Error(`${message}: ${result.error.message}`);
  return result.data;
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

async function findUsersByEmail(supabase: SupabaseClient) {
  const users = await listAuthUsers(supabase);
  const map = new Map<string, any>();

  for (const user of users) {
    if (user.email && USER_EMAILS.includes(user.email)) {
      map.set(user.email, user);
    }
  }

  return map;
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

async function clearSeededData(supabase: SupabaseClient) {
  const authUsersByEmail = await findUsersByEmail(supabase);
  const userIds = Array.from(authUsersByEmail.values()).map((user) => user.id);

  const { data: elections, error: electionsError } = await supabase
    .from("elections")
    .select("id")
    .in("title", [
      "COMSATS Vehari Student Council 2025",
      "Pakistan Tech Alliance Board 2025",
      "Green Future Fund Leadership Vote",
    ]);

  if (electionsError) {
    throw new Error(`Fetch seeded elections failed: ${electionsError.message}`);
  }

  const electionIds = (elections ?? []).map((election: { id: string }) => {
    return election.id;
  });

  await deleteRows(supabase, "votes", "election_id", electionIds);
  await deleteRows(supabase, "voter_registrations", "election_id", electionIds);
  await deleteRows(supabase, "candidates", "election_id", electionIds);
  await deleteRows(supabase, "elections", "id", electionIds);
  await deleteRows(supabase, "election_requests", "creator_id", userIds);
  await deleteRows(supabase, "audit_logs", "user_id", userIds);
  await deleteRows(supabase, "profiles", "id", userIds);

  for (const userId of userIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error && !error.message.toLowerCase().includes("not found")) {
      throw new Error(`Delete auth user failed: ${error.message}`);
    }
  }
}

async function createDemoUsers(supabase: SupabaseClient) {
  const profilesByEmail = new Map<string, { id: string; name: string }>();

  for (const user of DEMO_USERS) {
    const created = await requireNoError(
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
        },
      }),
      `Create auth user ${user.email} failed`
    );

    const userId = created.user.id;

    await requireNoError(
      await supabase.from("profiles").upsert(
        {
          id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
          is_approved: user.is_approved,
        },
        { onConflict: "id" }
      ),
      `Upsert profile ${user.email} failed`
    );

    profilesByEmail.set(user.email, { id: userId, name: user.name });
  }

  return profilesByEmail;
}

async function main() {
  const supabase = createSupabaseAdmin();
  console.log("Clearing existing VoteFlow demo seed data...");
  await clearSeededData(supabase);

  console.log("Creating demo auth users and profiles...");
  const profilesByEmail = await createDemoUsers(supabase);
  const creatorAbdullah = profilesByEmail.get("abdullah@comsats.edu.pk");
  const creatorAhmed = profilesByEmail.get("ahmed@techalliance.pk");
  const admin = profilesByEmail.get("admin@voteflow.pk");

  if (!creatorAbdullah || !creatorAhmed || !admin) {
    throw new Error("Missing required seeded profile.");
  }

  console.log("Creating election requests...");
  await requireNoError(
    await supabase.from("election_requests").insert([
      {
        creator_id: creatorAbdullah.id,
        organization: "COMSATS University Vehari",
        purpose: "Student Council Elections 2025",
        status: "approved",
      },
      {
        creator_id: creatorAhmed.id,
        organization: "Pakistan Tech Alliance",
        purpose: "Annual Board of Directors Election",
        status: "approved",
      },
    ]),
    "Create election requests failed"
  );

  const electionsSeed: SeedElection[] = [
    {
      key: "comsats",
      title: "COMSATS Vehari Student Council 2025",
      creatorEmail: "abdullah@comsats.edu.pk",
      category: "Student Body",
      description:
        "Annual student council elections for COMSATS University Islamabad, Vehari Campus. Students elect their representatives for the academic year 2025-26.",
      status: "active",
      start_time: addTime(-2, "hours"),
      end_time: addTime(2, "hours"),
      registration_deadline: addTime(-3, "hours"),
      max_voters: 20,
      candidates: [
        {
          name: "Sara Malik",
          designation: "Candidate for President",
          manifesto:
            "I will work tirelessly to improve student facilities, establish a student grievance portal, and ensure transparent allocation of society funds. Every student's voice will be heard.",
          photo_url: PLACEHOLDER_PHOTOS.sara,
        },
        {
          name: "Bilal Ahmed",
          designation: "Candidate for President",
          manifesto:
            "My vision is a campus where academic excellence meets opportunity. I plan to launch mentorship programs, industry partnerships, and a dedicated placement cell.",
          photo_url: PLACEHOLDER_PHOTOS.bilal,
        },
        {
          name: "Zara Khan",
          designation: "Candidate for President",
          manifesto:
            "Student welfare is my priority. Free mental health counseling, subsidized transport, and an active sports program — these are not promises, these are commitments.",
          photo_url: PLACEHOLDER_PHOTOS.zara,
        },
      ],
    },
    {
      key: "tech",
      title: "Pakistan Tech Alliance Board 2025",
      creatorEmail: "ahmed@techalliance.pk",
      category: "Corporate",
      description:
        "Election for the Board of Directors of Pakistan Tech Alliance for the term 2025-2027. Members vote for their preferred candidates.",
      status: "published",
      start_time: addTime(3, "days"),
      end_time: addTime(4, "days"),
      registration_deadline: addTime(2, "days"),
      max_voters: 15,
      candidates: [
        {
          name: "Faisal Siddiqui",
          designation: "Candidate for Board Director",
          manifesto:
            "15 years in Pakistan's tech industry. I bring strategic vision, investor relations expertise, and a network that will open new doors for our alliance members.",
          photo_url: PLACEHOLDER_PHOTOS.faisal,
        },
        {
          name: "Nadia Rehman",
          designation: "Candidate for Board Director",
          manifesto:
            "Women in tech need representation at the board level. I will champion diversity initiatives, launch scholarship programs, and build bridges with global tech organizations.",
          photo_url: PLACEHOLDER_PHOTOS.nadia,
        },
        {
          name: "Imran Butt",
          designation: "Candidate for Board Director",
          manifesto:
            "Startups are the future of Pakistan's economy. My focus will be on creating an ecosystem where early-stage founders get the mentorship, funding, and legal support they deserve.",
          photo_url: PLACEHOLDER_PHOTOS.imran,
        },
      ],
    },
    {
      key: "green",
      title: "Green Future Fund Leadership Vote",
      creatorEmail: "abdullah@comsats.edu.pk",
      category: "NGO",
      description:
        "Leadership election for the Green Future Pakistan Foundation. Selecting the Executive Director for the 2025 term.",
      status: "completed",
      start_time: addTime(-10, "days"),
      end_time: addTime(-9, "days"),
      registration_deadline: addTime(-11, "days"),
      max_voters: 10,
      candidates: [
        {
          name: "Hassan Ali",
          designation: "Candidate for Executive Director",
          manifesto:
            "A decade of environmental advocacy. I will scale our reforestation programs to 10 cities and secure international climate funding for Pakistan.",
          photo_url: PLACEHOLDER_PHOTOS.hassan,
        },
        {
          name: "Sana Mirza",
          designation: "Candidate for Executive Director",
          manifesto:
            "Grassroots change starts with education. I will prioritize school programs, community workshops, and building a volunteer network across Punjab.",
          photo_url: PLACEHOLDER_PHOTOS.sana,
        },
      ],
    },
  ];

  console.log("Creating elections and candidates...");
  const electionsByKey = new Map<string, { id: string; title: string }>();
  const candidatesByElection = new Map<string, Map<string, string>>();

  for (const election of electionsSeed) {
    const creator = profilesByEmail.get(election.creatorEmail);
    if (!creator) throw new Error(`Missing creator ${election.creatorEmail}`);

    const createdElection = await requireNoError(
      await supabase
        .from("elections")
        .insert({
          creator_id: creator.id,
          title: election.title,
          description: election.description,
          category: election.category,
          status: election.status,
          start_time: election.start_time,
          end_time: election.end_time,
          registration_deadline: election.registration_deadline,
          max_voters: election.max_voters,
        })
        .select("id, title")
        .single(),
      `Create election ${election.title} failed`
    );

    electionsByKey.set(election.key, createdElection);

    const createdCandidates = await requireNoError(
      await supabase
        .from("candidates")
        .insert(
          election.candidates.map((candidate) => ({
            election_id: createdElection.id,
            ...candidate,
          }))
        )
        .select("id, name"),
      `Create candidates for ${election.title} failed`
    );

    const candidateMap = new Map<string, string>();
    for (const candidate of createdCandidates) {
      candidateMap.set(candidate.name, candidate.id);
    }
    candidatesByElection.set(election.key, candidateMap);
  }

  console.log("Creating voter registrations...");
  const comsatsElection = electionsByKey.get("comsats");
  const techElection = electionsByKey.get("tech");
  const greenElection = electionsByKey.get("green");

  if (!comsatsElection || !techElection || !greenElection) {
    throw new Error("Missing seeded elections.");
  }

  const finalizedRegistrationRows: Record<string, unknown>[] = [];
  const pendingRegistrationRows: Record<string, unknown>[] = [];

  VOTERS.forEach((voter, index) => {
    const profile = profilesByEmail.get(voter.email);
    if (!profile) throw new Error(`Missing voter ${voter.email}`);

    finalizedRegistrationRows.push({
      election_id: comsatsElection.id,
      user_id: profile.id,
      secret_id: makeSecretId("POLL-CS25", index + 1),
      has_voted: index < 15,
    });
  });

  VOTERS.slice(0, 12).forEach((voter) => {
    const profile = profilesByEmail.get(voter.email);
    if (!profile) throw new Error(`Missing voter ${voter.email}`);

    pendingRegistrationRows.push({
      election_id: techElection.id,
      user_id: profile.id,
      has_voted: false,
    });
  });

  VOTERS.slice(0, 10).forEach((voter, index) => {
    const profile = profilesByEmail.get(voter.email);
    if (!profile) throw new Error(`Missing voter ${voter.email}`);

    finalizedRegistrationRows.push({
      election_id: greenElection.id,
      user_id: profile.id,
      secret_id: makeSecretId("POLL-GF24", index + 1),
      has_voted: true,
    });
  });

  await requireNoError(
    await supabase.from("voter_registrations").insert(finalizedRegistrationRows),
    "Create finalized voter registrations failed"
  );

  await requireNoError(
    await supabase.from("voter_registrations").insert(pendingRegistrationRows),
    "Create pending voter registrations failed"
  );

  console.warn(
    "Note: Election 2 registrations omit secret_id so this database can use its default placeholder IDs until finalized."
  );

  console.log("Creating anonymous votes...");
  const comsatsCandidates = candidatesByElection.get("comsats");
  const greenCandidates = candidatesByElection.get("green");
  if (!comsatsCandidates || !greenCandidates) {
    throw new Error("Missing seeded candidate maps.");
  }

  const voteRows = [
    ...Array.from({ length: 6 }, () => ({
      election_id: comsatsElection.id,
      candidate_id: comsatsCandidates.get("Sara Malik"),
    })),
    ...Array.from({ length: 5 }, () => ({
      election_id: comsatsElection.id,
      candidate_id: comsatsCandidates.get("Bilal Ahmed"),
    })),
    ...Array.from({ length: 4 }, () => ({
      election_id: comsatsElection.id,
      candidate_id: comsatsCandidates.get("Zara Khan"),
    })),
    ...Array.from({ length: 6 }, () => ({
      election_id: greenElection.id,
      candidate_id: greenCandidates.get("Hassan Ali"),
    })),
    ...Array.from({ length: 4 }, () => ({
      election_id: greenElection.id,
      candidate_id: greenCandidates.get("Sana Mirza"),
    })),
  ];

  await requireNoError(
    await supabase.from("votes").insert(voteRows),
    "Create votes failed"
  );

  console.log("Creating audit logs...");
  await requireNoError(
    await supabase.from("audit_logs").insert([
      {
        user_id: creatorAbdullah.id,
        action: "election_created",
        details: { title: "COMSATS Vehari Student Council 2025" },
      },
      {
        user_id: creatorAbdullah.id,
        action: "voter_ids_generated",
        details: { election: "COMSATS", count: 20 },
      },
      ...Array.from({ length: 5 }, () => ({
        user_id: admin.id,
        action: "vote_cast",
        details: { election: "COMSATS" },
      })),
      {
        user_id: admin.id,
        action: "login",
        details: { email: "admin@voteflow.pk" },
      },
      {
        user_id: admin.id,
        action: "approval",
        details: { organization: "COMSATS University Vehari" },
      },
      {
        user_id: creatorAbdullah.id,
        action: "election_created",
        details: { title: "Green Future Fund Leadership Vote" },
      },
      {
        user_id: creatorAbdullah.id,
        action: "election_completed",
        details: { title: "Green Future Fund", winner: "Hassan Ali" },
      },
    ]),
    "Create audit logs failed"
  );

  console.log("VoteFlow demo seed complete.");
  console.log("Super Admin: admin@voteflow.pk / Admin1234!");
  console.log("Creator: abdullah@comsats.edu.pk / Creator1234!");
  console.log("Creator: ahmed@techalliance.pk / Creator1234!");
  console.log("Voters: voter01@gmail.com through voter20@gmail.com / Voter1234!");
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
