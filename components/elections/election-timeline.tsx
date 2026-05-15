import { format } from "date-fns";
import { Calendar } from "lucide-react";

import type { ElectionDetail } from "@/lib/elections/data";

interface ElectionTimelineProps {
  election: Pick<
    ElectionDetail,
    "registration_deadline" | "start_time" | "end_time"
  >;
}

function formatDate(value: string | null) {
  if (!value) return "TBD";
  return format(new Date(value), "MMM d, yyyy 'at' h:mm a");
}

export function ElectionTimeline({ election }: ElectionTimelineProps) {
  const items = [
    {
      label: "Registration deadline",
      value: formatDate(election.registration_deadline),
    },
    { label: "Election starts", value: formatDate(election.start_time) },
    { label: "Election ends", value: formatDate(election.end_time) },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-teal" />
        <h2 className="font-heading text-lg font-bold text-ink">Timeline</h2>
      </div>
      <ul className="mt-6 space-y-5">
        {items.map((item, index) => (
          <li key={item.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-3 w-3 rounded-full bg-teal" />
              {index < items.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{item.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
