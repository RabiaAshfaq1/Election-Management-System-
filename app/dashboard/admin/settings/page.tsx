import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireRole } from "@/lib/auth-server";

export default async function AdminSettingsPage() {
  await requireRole("super_admin");

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Platform configuration and preferences."
      />
      <div className="rounded-2xl border border-border bg-white p-8 shadow-card">
        <p className="text-sm text-muted">
          Global settings (email templates, default election limits, maintenance
          mode) can be configured here in a future release.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-ink">
          <li className="flex justify-between border-b border-border py-2">
            <span>Environment</span>
            <span className="font-mono text-muted">
              {process.env.NODE_ENV ?? "development"}
            </span>
          </li>
          <li className="flex justify-between border-b border-border py-2">
            <span>App URL</span>
            <span className="font-mono text-muted">
              {process.env.NEXT_PUBLIC_APP_URL ?? "Not set"}
            </span>
          </li>
        </ul>
      </div>
    </>
  );
}
