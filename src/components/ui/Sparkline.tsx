import type { TimeseriesPoint } from "@/lib/providers/types";

export function Sparkline({
  points,
  width = 96,
  height = 28,
  ariaLabel,
}: {
  points: TimeseriesPoint[];
  width?: number;
  height?: number;
  ariaLabel: string;
}) {
  const values = points.map((p) => p.v ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1 || 1)) * width;
    const y = height - ((((p.v ?? 0) - min) / range) * (height - 4) + 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="text-[color:var(--color-accent)]"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
