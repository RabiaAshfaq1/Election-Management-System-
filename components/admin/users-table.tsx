"use client";

import { format } from "date-fns";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { EmptyState } from "@/components/dashboard/empty-state";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  users: AdminUserRow[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  const csvRows = filtered.map((u) => [
    u.name,
    u.email,
    u.role.replace("_", " "),
    format(new Date(u.created_at), "yyyy-MM-dd"),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <CsvExportButton
          filename="users.csv"
          headers={["Name", "Email", "Role", "Joined"]}
          rows={csvRows}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="No users found"
          description="Try a different search term."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-paper/60">
                  <th className="px-5 py-3.5 font-semibold text-ink">Name</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Email</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Role</th>
                  <th className="px-5 py-3.5 font-semibold text-ink">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-paper/40">
                    <td className="px-5 py-4 font-medium text-ink">{u.name}</td>
                    <td className="px-5 py-4 text-muted">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold capitalize text-ink">
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {format(new Date(u.created_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
