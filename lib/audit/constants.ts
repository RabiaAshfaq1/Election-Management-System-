export type AuditActionFilter =
  | "all"
  | "login"
  | "vote_cast"
  | "approval"
  | "rejection"
  | "voter_ids_generated"
  | "election_created"
  | "override";

export const AUDIT_FILTER_OPTIONS: { value: AuditActionFilter; label: string }[] =
  [
    { value: "all", label: "All actions" },
    { value: "login", label: "Login" },
    { value: "vote_cast", label: "Vote cast" },
    { value: "approval", label: "Approval" },
    { value: "rejection", label: "Rejection" },
    { value: "voter_ids_generated", label: "Voter IDs generated" },
    { value: "election_created", label: "Election created" },
    { value: "override", label: "Override" },
  ];

const FILTER_ACTION_MAP: Record<Exclude<AuditActionFilter, "all">, string[]> = {
  login: ["login", "user_login"],
  vote_cast: ["vote_cast"],
  approval: [
    "election_request_approved",
    "election_request_approved_email",
  ],
  rejection: [
    "election_request_rejected",
    "election_request_rejected_email",
  ],
  voter_ids_generated: ["voter_ids_generated"],
  election_created: ["election_created"],
  override: ["override", "admin_override", "result_override"],
};

export function getActionsForFilter(filter: AuditActionFilter): string[] | null {
  if (filter === "all") return null;
  return FILTER_ACTION_MAP[filter];
}

export type AuditBadgeVariant =
  | "teal"
  | "blue-gray"
  | "gold"
  | "red"
  | "green"
  | "default";

export function getActionBadgeVariant(action: string): AuditBadgeVariant {
  if (action === "vote_cast") return "teal";
  if (action === "login" || action === "user_login") return "blue-gray";
  if (
    action.includes("approved") ||
    action.includes("approval")
  ) {
    return "gold";
  }
  if (
    action.includes("rejected") ||
    action.includes("rejection")
  ) {
    return "gold";
  }
  if (action.includes("override")) return "red";
  if (
    action === "election_created" ||
    action.includes("election_created")
  ) {
    return "green";
  }
  return "default";
}

export const BADGE_CLASS: Record<AuditBadgeVariant, string> = {
  teal: "bg-teal/10 text-teal",
  "blue-gray": "bg-slate-100 text-slate-700",
  gold: "bg-gold/15 text-ink",
  red: "bg-accent/10 text-accent",
  green: "bg-emerald-100 text-emerald-800",
  default: "bg-paper text-muted border border-border",
};

export const PAGE_SIZE = 20;
