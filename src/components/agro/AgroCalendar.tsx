import { Card } from "@/components/ui/Card";
import { CROP_REFERENCE } from "@/lib/agro/culturas";
import { cn } from "@/lib/cn";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/**
 * Calendário agrícola (ATUALIZACAO_DO_VIGIA.md §14) — referência geral
 * por mês, não zoneamento oficial (ver aviso no rodapé e em
 * `lib/agro/culturas.ts`).
 */
export function AgroCalendar({ currentMonth = new Date().getMonth() + 1 }: { currentMonth?: number }) {
  return (
    <Card className="flex flex-col gap-3 overflow-x-auto p-4">
      <h3 className="text-base font-semibold text-[color:var(--color-text)]">Calendário agrícola — referência geral</h3>
      <table className="min-w-[640px] border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-[color:var(--color-surface)] p-1.5 text-left font-medium text-[color:var(--color-text-subtle)]">
              Cultura
            </th>
            {MONTH_NAMES.map((m, i) => (
              <th
                key={m}
                className={cn(
                  "p-1.5 text-center font-medium",
                  i + 1 === currentMonth
                    ? "text-[color:var(--color-accent)]"
                    : "text-[color:var(--color-text-subtle)]"
                )}
              >
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CROP_REFERENCE.map((crop) => (
            <tr key={crop.key} className="border-t border-[color:var(--color-border)]">
              <td className="sticky left-0 bg-[color:var(--color-surface)] p-1.5 font-medium text-[color:var(--color-text)]">
                {crop.name}
              </td>
              {MONTH_NAMES.map((_, i) => {
                const active = crop.typicalPlantingMonths.includes(i + 1);
                return (
                  <td key={i} className="p-1.5 text-center">
                    <span
                      className={cn(
                        "mx-auto block h-2.5 w-2.5 rounded-full",
                        active ? "bg-[color:var(--color-accent)]" : "bg-[color:var(--color-border)]"
                      )}
                      aria-label={active ? "Plantio indicado" : "Fora de época"}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-[color:var(--color-text-subtle)]">
        Referência geral de necessidade térmica por cultura — não é o zoneamento agrícola oficial
        por município. Para uma decisão de plantio real, consulte o IDR-Paraná
        (idrparana.pr.gov.br).
      </p>
    </Card>
  );
}
