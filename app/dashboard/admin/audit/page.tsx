import { AuditTrail } from "@/components/admin/audit-trail";
import { fetchAuditLogs } from "@/lib/audit/queries";

export default async function AdminAuditPage() {
  const initialData = await fetchAuditLogs({ page: 1 });

  return <AuditTrail initialData={initialData} />;
}
