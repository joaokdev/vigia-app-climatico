"use client";

import { usePathname } from "next/navigation";

/**
 * Continuidade de navegação inspirada no princípio do pacote de
 * referência "page-transitions": transição curta o suficiente para
 * comunicar "você mudou de contexto" sem atrasar o usuário. Duração
 * de ~220ms, respeitando prefers-reduced-motion globalmente (ver
 * globals.css). Reimplementação própria, sem copiar o código-fonte
 * do efeito.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
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
  );
}
