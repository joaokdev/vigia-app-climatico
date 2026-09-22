"use client";

import { useEffect, useState } from "react";
import { IconRefresh } from "@/components/icons";
import type { Provenance } from "@/lib/providers/types";

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return `há ${days} d`;
}

/**
 * Sempre visível quando um dado sensível ao tempo é mostrado.
 * Comunica: fonte, quando foi observado e se está desatualizado.
 */
export function DataFreshness({ provenance }: { provenance: Provenance }) {
  // `null` até montar no cliente: `formatRelative` depende de
  // `Date.now()`, que quase nunca bate entre o momento em que a página
  // (estática/SSG) foi gerada e o momento em que o navegador da pessoa
  // realmente hidrata — isso causava hydration mismatch de texto em
  // toda página que usa este componente (Home, Mapa, Cidade). O rótulo
  // exato só é calculado depois de montar, no efeito abaixo; até lá
  // mostramos um texto neutro que é idêntico em servidor e cliente.
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    // Mesmo caso do ThemeProvider: sincronização única com uma fonte
    // externa (o relógio) na montagem, não estado derivado de props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel(formatRelative(provenance.observedAt));
    const id = setInterval(
      () => setLabel(formatRelative(provenance.observedAt)),
      30_000
    );
    return () => clearInterval(id);
  }, [provenance.observedAt]);

  const isStale = provenance.status === "stale" || provenance.status === "indisponivel";

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--color-text-subtle)]">
      <IconRefresh size={13} className={isStale ? "opacity-60" : "text-[color:var(--color-accent)]"} />
      <span>
        Atualizado {label ?? "recentemente"}
        {isStale && (
          <span className="ml-1 text-[color:var(--color-warning)]">
            · pode estar desatualizado
          </span>
        )}
      </span>
    </div>
  );
}
