import { IconEye } from "@/components/icons";

/**
 * Espaço reservado para o "VIGIA Intelligence" (camada de IA) da
 * FASE 2/3. Aqui é apenas uma demonstração visual de como um insight
 * gerado apareceria — texto fixo, claramente rotulado como mock.
 * Nenhuma chamada de modelo acontece na FASE 1.
 */
export function AIInsight({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-accent-soft)] p-4">
      <IconEye size={18} className="mt-0.5 shrink-0 text-[color:var(--color-accent)]" />
      <div className="flex flex-col gap-1">
        <p className="text-eyebrow text-[color:var(--color-accent)]">
          VIGIA Intelligence · exemplo demonstrativo
        </p>
        <p className="text-sm text-[color:var(--color-text)]">{text}</p>
        <p className="text-[11px] text-[color:var(--color-text-subtle)]">
          Texto fixo de demonstração — a geração real de insights por IA
          chega em fase futura, não na FASE 1.
        </p>
      </div>
    </div>
  );
}
