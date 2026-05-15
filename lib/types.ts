export type UserRole = "super_admin" | "election_creator" | "voter";

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  is_approved: boolean;
  created_at: string;
}

export type ElectionRequestStatus = "pending" | "approved" | "rejected";

export type ElectionStatus = "draft" | "published" | "active" | "completed";

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  designation: string | null;
  manifesto: string | null;
  photo_url: string | null;
  created_at: string;
}
