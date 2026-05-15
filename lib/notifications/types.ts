export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  election_id: string | null;
  read_at: string | null;
  sent_at: string;
}
