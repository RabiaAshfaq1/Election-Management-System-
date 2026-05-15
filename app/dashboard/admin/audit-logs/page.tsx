import { redirect } from "next/navigation";

export default function AdminAuditLogsRedirect() {
  redirect("/dashboard/admin/audit");
}
