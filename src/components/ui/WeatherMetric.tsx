import type { ReactNode } from "react";

export function WeatherMetric({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[color:var(--color-text-subtle)]" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="font-data text-sm text-[color:var(--color-text)]">
          {value === null || value === undefined ? "—" : value}
          {value !== null && unit ? (
            <span className="text-[color:var(--color-text-subtle)]"> {unit}</span>
          ) : null}
        </span>
        <span className="text-[11px] text-[color:var(--color-text-subtle)]">
          {label}
        </span>
      </div>
    </div>
  );
}
