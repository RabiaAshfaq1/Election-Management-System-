interface AdminPageHeaderProps {
  title: string;
  description?: string;
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-3xl font-bold text-ink">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
