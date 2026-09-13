"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "../effects/page-transition/glob-wipe.css";

/**
 * Continuidade de navegação usando o efeito de terceiro "Glob Wipe"
 * (pacote page-transitions) sem alterar cor, curva de easing ou o
 * keyframe original — apenas adaptado de "troca entre duas páginas
 * falsas numa janela de preview" para "troca de rota real do Next.js
 * App Router". Ver glob-wipe.css para o detalhamento da adaptação.
 */
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
    const timeout = setTimeout(() => setActive(false), 1000);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <div className={`pt-glob-root${active ? " is-active" : ""}`} aria-hidden="true">
        <div className="pt-glob-root__blob" />
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
