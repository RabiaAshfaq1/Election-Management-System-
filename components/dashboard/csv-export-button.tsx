"use client";

import { Download } from "lucide-react";

import { downloadCsv } from "@/lib/csv-export";

interface CsvExportButtonProps {
  filename: string;
  headers: string[];
  rows: string[][];
  disabled?: boolean;
}

export function CsvExportButton({
  filename,
  headers,
  rows,
  disabled,
}: CsvExportButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || rows.length === 0}
      onClick={() => downloadCsv(filename, headers, rows)}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
