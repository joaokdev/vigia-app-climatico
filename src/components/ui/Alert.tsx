import { IconAlert } from "@/components/icons";
import type { OfficialAlert } from "@/lib/providers/types";
import { cn } from "@/lib/cn";

const SEVERITY_STYLE: Record<OfficialAlert["severity"], string> = {
  info: "border-[color:var(--color-info)] bg-[color:var(--color-info-soft)] text-[color:var(--color-info)]",
  atencao:
    "border-[color:var(--color-warning)] bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]",
  perigo:
    "border-[color:var(--color-danger)] bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger)]",
  "perigo-potencial":
    "border-[color:var(--color-danger)] bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger)]",
};

const SEVERITY_LABEL: Record<OfficialAlert["severity"], string> = {
  info: "Informativo",
  atencao: "Atenção",
  perigo: "Perigo",
  "perigo-potencial": "Perigo potencial",
};

export function AlertBanner({ alert }: { alert: OfficialAlert }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3",
        SEVERITY_STYLE[alert.severity]
      )}
    >
      <IconAlert size={20} className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide">
            {SEVERITY_LABEL[alert.severity]} · Alerta oficial
          </span>
        </div>
        <p className="text-sm font-medium text-[color:var(--color-text)]">
          {alert.title}
        </p>
        <p className="text-sm text-[color:var(--color-text-muted)]">{alert.summary}</p>
        <p className="text-xs text-[color:var(--color-text-subtle)]">
          Emitido por {alert.issuingAuthority}
        </p>
      </div>
    </div>
  );
}

export function AlertCard({ alert }: { alert: OfficialAlert }) {
  return (
    <li className="flex flex-col gap-1 border-b border-[color:var(--color-border)] py-3 last:border-0">
      <div className="flex items-center gap-2 text-xs">
        <span className={cn("rounded-full px-2 py-0.5 font-medium", SEVERITY_STYLE[alert.severity])}>
          {SEVERITY_LABEL[alert.severity]}
        </span>
        <span className="text-[color:var(--color-text-subtle)]">{alert.issuingAuthority}</span>
      </div>
      <p className="text-sm font-medium text-[color:var(--color-text)]">{alert.title}</p>
      <p className="text-sm text-[color:var(--color-text-muted)]">{alert.summary}</p>
    </li>
  );
}
