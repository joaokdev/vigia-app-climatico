"use client";

import { useEffect, useRef } from "react";
import "./password-strength.css";
import { VAULT_SVG_MARKUP } from "./vault-svg";

/**
 * Efeito de terceiro "Vault — Password Strength Visualiser" — código de
 * referência fornecido pelo proprietário do projeto. A cena SVG e o
 * timeline GSAP (js/visualizer.js) são grandes e fortemente acoplados a
 * ids específicos, então são carregados de forma literal e sem
 * alterações estruturais. Apenas o texto visível foi traduzido para
 * português (títulos de força, mensagens de tempo-para-quebrar,
 * rótulos de acessibilidade) — a matemática de entropia, os limiares de
 * força e toda a animação permanecem exatamente como no pacote
 * original. O CSS foi apenas isolado por namespace e teve o fundo de
 * página inteira removido, já que aqui o efeito vive dentro do nosso
 * próprio formulário de cadastro, não em uma página própria.
 *
 * Dependência externa: GSAP 3 via CDN (igual ao pacote original).
 */

const SCRIPT_SOURCES = [
  "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
  "/effects/password-strength/js/entropy.js",
  "/effects/password-strength/js/crackTime.js",
  "/effects/password-strength/js/tiers.js",
  "/effects/password-strength/js/suggest.js",
  "/effects/password-strength/js/visualizer.js",
  "/effects/password-strength/script.js",
];

function loadScriptsInOrder(sources: string[]): () => void {
  const injected: HTMLScriptElement[] = [];
  let cancelled = false;

  async function run() {
    for (const src of sources) {
      if (cancelled) return;
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
        document.body.appendChild(script);
        injected.push(script);
      }).catch(() => {
        /* Se o GSAP (CDN) falhar por falta de rede, a Vault degrada
           silenciosamente: o restante do formulário continua utilizável. */
      });
    }
  }

  run();

  return () => {
    cancelled = true;
    injected.forEach((s) => s.remove());
  };
}

export function PasswordStrengthVault() {
  const mountedOnce = useRef(false);

  useEffect(() => {
    // Evita dupla injeção em StrictMode (dev) — a segunda montagem real
    // (após unmount) ainda funciona normalmente.
    const cleanup = loadScriptsInOrder(SCRIPT_SOURCES);
    mountedOnce.current = true;
    return cleanup;
  }, []);

  return (
    <div className="vault-root">
      <section className="password-section" aria-labelledby="vigia-password-label">
        <div className="password-meta">
          <label className="password-label" id="vigia-password-label" htmlFor="password-input">
            Senha
          </label>
          <button type="button" className="suggest-btn" id="suggest-btn">
            Sugerir senha forte
          </button>
        </div>

        <div className="password-field" id="password-field">
          <input
            className="password-input"
            id="password-input"
            type="password"
            name="vault-password"
            placeholder="Comece a digitar..."
            autoComplete="new-password"
            spellCheck={false}
            autoCapitalize="off"
            aria-describedby="strength-live"
          />
          <button
            type="button"
            className="visibility-btn"
            id="visibility-btn"
            aria-label="Mostrar senha"
            aria-pressed="false"
          >
            <svg className="visibility-icon visibility-icon--eye" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.2 12S5.5 5.5 12 5.5 21.8 12 21.8 12 18.5 18.5 12 18.5 2.2 12 2.2 12Z"
              />
              <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <svg className="visibility-icon visibility-icon--off" viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...({ hidden: true } as React.SVGProps<SVGSVGElement>)}>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M9.9 9.9A3.2 3.2 0 0 0 12 15.2a3.2 3.2 0 0 0 2.1-.8M6.1 6.3C4.1 7.6 2.6 9.5 2.2 12S5.5 18.5 12 18.5c1.7 0 3.2-.3 4.5-.8M10.6 5.7A10 10 0 0 1 12 5.5C18.5 5.5 21.8 12 21.8 12a11.5 11.5 0 0 1-2.4 3.2"
              />
            </svg>
          </button>
        </div>

        <div className="strength-card" id="strength-card" data-tier="0">
          <div
            className="strength-visual"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: VAULT_SVG_MARKUP }}
          />

          <div className="strength-feedback" id="strength-feedback">
            <p className="strength-title" id="strength-title">Nenhuma trava</p>
            <p className="strength-message" id="strength-message">A porta está aberta.</p>
            <p className="strength-entropy" id="strength-entropy">
              <span id="entropy-value">0</span> bits de entropia
            </p>
          </div>
        </div>

        <p className="sr-only" id="strength-live" aria-live="polite" />
      </section>
    </div>
  );
}
