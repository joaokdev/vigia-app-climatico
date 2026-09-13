"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "../effects/page-transition/glob-wipe.css";

/**
 * Continuidade de navegação usando a evolução do efeito de terceiro
 * "Glob Wipe" (ver glob-wipe.css para o detalhamento da ETAPA 5:
 * duas camadas atmosféricas — halo + faixa — em vez de um blob
 * único, 620ms em vez de 1000ms). O timeout abaixo precisa ficar
 * igual ou levemente maior que a duração total das animações CSS
 * (620ms + 30ms de delay da faixa = 650ms) para remover o overlay
 * só depois que as duas camadas já terminaram de sumir — removê-lo
 * antes faria a transição cortar abruptamente.
 */
const PT_DURATION_MS = 620;
const PT_BAND_DELAY_MS = 30;
const PT_CLEANUP_MS = PT_DURATION_MS + PT_BAND_DELAY_MS + 40;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setActive(true);
    const timeout = setTimeout(() => setActive(false), PT_CLEANUP_MS);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <div className={`pt-glob-root${active ? " is-active" : ""}`} aria-hidden="true">
        <div className="pt-glob-root__mist" />
        <div className="pt-glob-root__band" />
      </div>
      <div key={pathname} className="animate-[vigia-page-in_var(--duration-base)_var(--ease-standard)]">
        {children}
        <style jsx global>{`
          @keyframes vigia-page-in {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
}
