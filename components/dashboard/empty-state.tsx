import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card rounded-2xl border-dashed px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-3xl">
        {emoji}
      </div>
      <p className="font-heading text-lg font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
