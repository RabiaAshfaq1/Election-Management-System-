import type { ElectionStatus } from "@/lib/types";

export interface ElectionTimingFields {
  status: ElectionStatus;
  start_time: string | null;
  end_time: string | null;
  registration_deadline: string | null;
  max_voters: number;
  voter_count: number;
  registrations_locked?: boolean;
}

export function isRegistrationDeadlineOpen(
  election: Pick<ElectionTimingFields, "registration_deadline">
) {
  if (!election.registration_deadline) return true;
  return new Date(election.registration_deadline) > new Date();
}

export function hasAvailableSpots(
  election: Pick<ElectionTimingFields, "voter_count" | "max_voters" | "registrations_locked">
) {
  if (election.registrations_locked) return false;
  return election.voter_count < election.max_voters;
}

export type ElectionRegistrationFields = Pick<
  ElectionTimingFields,
  | "status"
  | "registration_deadline"
  | "voter_count"
  | "max_voters"
  | "registrations_locked"
>;

export function canRegisterForElection(election: ElectionRegistrationFields) {
  if (!["published", "active"].includes(election.status)) return false;
  if (!isRegistrationDeadlineOpen(election)) return false;
  return hasAvailableSpots(election);
}

export function isElectionFull(
  election: Pick<
    ElectionTimingFields,
    "voter_count" | "max_voters" | "registrations_locked"
  >
) {
  return (
    election.registrations_locked ||
    election.voter_count >= election.max_voters
  );
}

export function getStatusLabel(status: ElectionStatus) {
  switch (status) {
    case "published":
      return "Upcoming";
    case "active":
      return "Live";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}
