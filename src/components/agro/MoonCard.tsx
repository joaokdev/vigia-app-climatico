import { Card } from "@/components/ui/Card";
import { IconMoon } from "@/components/icons";
import { getMoonPhase, MOON_PHASE_LABEL, MOON_PLANTING_TRADITION } from "@/lib/moon-phase";

/**
 * ATUALIZACAO_DO_VIGIA.md §15: a fase é calculada (astronomia real,
 * `lib/moon-phase.ts` — já usado pela página global /agro); a
 * associação a culturas é tradição cultural, nunca ciência — os dois
 * blocos abaixo são visualmente e textualmente separados.
 */
export function MoonCard() {
  const moon = getMoonPhase();

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <IconMoon size={18} className="text-[color:var(--color-accent)]" />
        <h3 className="text-base font-semibold text-[color:var(--color-text)]">Lua de hoje</h3>
      </div>

      <div>
        <p className="font-data text-lg text-[color:var(--color-text)]">Fase: {MOON_PHASE_LABEL[moon.phase]}</p>
        <p className="text-xs text-[color:var(--color-text-subtle)]">
          Iluminação aproximada: {Math.round(moon.illuminationFraction * 100)}% · calculada astronomicamente
        </p>
      </div>

      <div className="border-t border-[color:var(--color-border)] pt-3">
        <p className="text-eyebrow text-[color:var(--color-text-subtle)]">Tradição de plantio</p>
        <p className="text-sm text-[color:var(--color-text-muted)]">{MOON_PLANTING_TRADITION[moon.phase]}</p>
        <p className="mt-1 text-[11px] text-[color:var(--color-text-subtle)]">
          Referência cultural popular — não é uma recomendação técnica nem medição científica.
        </p>
      </div>
    </Card>
  );
}
