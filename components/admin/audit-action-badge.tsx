import {
  BADGE_CLASS,
  getActionBadgeVariant,
} from "@/lib/audit/constants";
import { cn } from "@/lib/utils";

interface AuditActionBadgeProps {
  action: string;
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const variant = getActionBadgeVariant(action);

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        BADGE_CLASS[variant]
      )}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
}
