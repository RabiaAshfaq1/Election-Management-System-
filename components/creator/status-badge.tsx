import type { ElectionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<ElectionStatus, string> = {
  draft: "bg-muted/15 text-muted",
  published: "bg-gold/15 text-ink",
  active: "bg-teal/10 text-teal",
  completed: "bg-paper text-muted border border-border",
};

interface StatusBadgeProps {
  status: ElectionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
