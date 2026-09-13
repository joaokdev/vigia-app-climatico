"use client";

import { useEffect, useRef } from "react";
import "./social-links.css";

/**
 * Efeito de terceiro "Social Media Buttons" — código de referência
 * fornecido pelo proprietário do projeto. CSS e SVGs de marca
 * preservados sem alteração (cores, geometria do tooltip, spring
 * easing). Removido apenas o fundo de página inteira do pacote
 * original (isso é "lugar", não o efeito em si) e a posição
 * (`transform: translateY`) usada para centralizar na vitrine
 * original — aqui o componente vive no rodapé, não em uma página
 * própria.
 *
 * O VIGIA ainda não possui contas reais nessas redes (não há
 * comunidade nem backend na FASE 1), então os links não navegam
 * para lugar nenhum ainda — o rótulo do tooltip (nome da rede)
 * continua exatamente como no efeito original, só a navegação foi
 * desativada para não fingir uma presença que ainda não existe.
 */

const LINKS = [
  {
    key: "facebook",
    label: "Facebook",
    path: "M13.86 22v-8.45h2.84l.43-3.3h-3.27V8.14c0-.96.27-1.61 1.64-1.61h1.75V3.58a23.4 23.4 0 0 0-2.55-.13c-2.52 0-4.25 1.54-4.25 4.36v2.44H7.6v3.3h2.85V22h3.41Z",
  },
  {
    key: "twitter",
    label: "Twitter",
    path: "M18.24 2H21l-6.03 6.89L22.06 22H16.5l-4.35-5.69L7.17 22H4.4l6.45-7.37L4.06 2h5.7l3.93 5.2L18.24 2Zm-.97 17.69h1.53L8.92 4.19H7.28l9.99 15.5Z",
  },
  {
    key: "instagram",
    label: "Instagram",
    path: "M7.45 2h9.1A5.46 5.46 0 0 1 22 7.45v9.1A5.46 5.46 0 0 1 16.55 22h-9.1A5.46 5.46 0 0 1 2 16.55v-9.1A5.46 5.46 0 0 1 7.45 2Zm0 1.82a3.64 3.64 0 0 0-3.63 3.63v9.1a3.64 3.64 0 0 0 3.63 3.63h9.1a3.64 3.64 0 0 0 3.63-3.63v-9.1a3.64 3.64 0 0 0-3.63-3.63h-9.1Zm9.55 1.36a1.36 1.36 0 1 1 0 2.73 1.36 1.36 0 0 1 0-2.73ZM12 6.86A5.14 5.14 0 1 1 12 17.14 5.14 5.14 0 0 1 12 6.86Zm0 1.82A3.32 3.32 0 1 0 12 15.32 3.32 3.32 0 0 0 12 8.68Z",
    fillRule: "evenodd" as const,
  },
  {
    key: "github",
    label: "Github",
    path: "M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49l-.01-1.92c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.39 9.39 0 0 1 12 6.93a9.3 9.3 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.94.68 1.89l-.01 2.82c0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z",
    fillRule: "evenodd" as const,
  },
  {
    key: "youtube",
    label: "Youtube",
    path: "M21.58 7.19a2.83 2.83 0 0 0-1.99-2C17.84 4.72 12 4.72 12 4.72s-5.84 0-7.59.47a2.83 2.83 0 0 0-1.99 2A29.52 29.52 0 0 0 1.95 12c0 1.63.16 3.25.47 4.81a2.83 2.83 0 0 0 1.99 2c1.75.47 7.59.47 7.59.47s5.84 0 7.59-.47a2.83 2.83 0 0 0 1.99-2c.31-1.56.47-3.18.47-4.81 0-1.63-.16-3.25-.47-4.81ZM10 15.12V8.88L15.2 12 10 15.12Z",
  },
];

export function SocialLinks() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const links = [...root.querySelectorAll<HTMLAnchorElement>(".social-link")];
    const blockNextNavigation = new WeakSet<HTMLAnchorElement>();

    function closeAll(except?: HTMLAnchorElement) {
      links.forEach((link) => {
        if (link !== except) link.classList.remove("is-active");
      });
    }

    const cleanups: Array<() => void> = [];

    links.forEach((link) => {
      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse") return;
        if (link.classList.contains("is-active")) return;
        closeAll(link);
        link.classList.add("is-active");
        blockNextNavigation.add(link);
      };
      const onClick = (event: MouseEvent) => {
        // Contas reais ainda não existem na FASE 1 — nunca navega.
        event.preventDefault();
        blockNextNavigation.delete(link);
      };
      const onBlur = () => link.classList.remove("is-active");

      link.addEventListener("pointerdown", onPointerDown);
      link.addEventListener("click", onClick);
      link.addEventListener("blur", onBlur);
      cleanups.push(() => {
        link.removeEventListener("pointerdown", onPointerDown);
        link.removeEventListener("click", onClick);
        link.removeEventListener("blur", onBlur);
      });
    });

    const onDocPointerDown = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest(".social-link")) closeAll();
    };
    const onDocKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeAll();
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onDocKeydown);

    return () => {
      cleanups.forEach((fn) => fn());
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onDocKeydown);
    };
  }, []);

  return (
    <div className="smb-root" ref={rootRef}>
      <nav className="social-links" aria-label="Redes sociais do VIGIA (em breve)">
        {LINKS.map((item) => (
          <a
            key={item.key}
            className={`social-link social-link--${item.key}`}
            href="#"
            aria-label={`${item.label} (em breve)`}
            data-label={item.label}
          >
            <svg className={`social-link__logo social-link__logo--${item.key}`} viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule={item.fillRule} d={item.path} />
            </svg>
          </a>
        ))}
      </nav>
    </div>
  );
}
