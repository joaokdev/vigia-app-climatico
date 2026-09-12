export function DataSourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-sm)] border border-[color:var(--color-border)] px-2 py-0.5 text-[11px] text-[color:var(--color-text-subtle)]">
      {source}
    </span>
  );
}
