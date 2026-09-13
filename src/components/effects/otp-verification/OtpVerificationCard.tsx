"use client";

import { useEffect, useRef } from "react";
import "./otp-verification.css";

/**
 * Efeito de terceiro "OTP Verification" — código de referência fornecido
 * pelo proprietário do projeto. A animação (script.js) é grande e
 * fortemente coreografada (WAAPI + geometria 3D do "circuito"), então
 * ela é carregada de forma literal e sem alterações estruturais — só o
 * texto visível foi traduzido para português e o código de demonstração
 * trocado (veja /public/effects/otp-verification/script.js). O CSS foi
 * apenas isolado por namespace (cores/tempos/tamanhos preservados) e
 * teve o fundo ambiente de página inteira removido (isso é "lugar", não
 * o efeito em si).
 *
 * O script dispara um evento "vigia:otp-verified" quando o usuário clica
 * em "Continuar" na tela de sucesso — é nisso que a página que usa este
 * componente deve escutar para prosseguir o fluxo.
 */
export function OtpVerificationCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Injeta um <script> novo a cada montagem para garantir que a IIFE
    // rode de novo contra o DOM atual (o cache de <Script> do Next não
    // re-executaria em uma segunda visita client-side à página).
    const script = document.createElement("script");
    script.src = "/effects/otp-verification/script.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="otp-root">
      <section
        className="verification-card"
        id="verification-card"
        data-state="idle"
        aria-labelledby="card-title"
        aria-describedby="card-subtitle"
      >
        <div className="card-energy-rim" aria-hidden="true" />

        <div className="verification-copy">
          <h1 className="card-title" id="card-title" tabIndex={-1}>
            Verifique seu e-mail
          </h1>
          <p className="card-subtitle" id="card-subtitle">
            Digite o código de 4 dígitos que enviamos para{" "}
            <span className="phone-number" aria-hidden="true">
              o seu e-mail
            </span>
            <span className="sr-only">o endereço de e-mail cadastrado</span>
          </p>
        </div>

        <div className="stage-stack">
          <form className="verification-form" id="otp-form">
            <label className="sr-only" htmlFor="otp-input">
              Código de verificação de 4 dígitos
            </label>
            <input
              className="otp-input"
              id="otp-input"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={4}
              enterKeyHint="done"
              spellCheck={false}
              aria-describedby="card-subtitle demo-note otp-feedback"
            />

            <div className="otp-scene" id="otp-scene">
              <div className="circuit-plane" id="circuit-plane" aria-hidden="true">
                <div className="wire wire--0"><span /></div>
                <div className="wire wire--1"><span /></div>
                <div className="wire wire--2"><span /></div>
                <div className="wire wire--3"><span /></div>

                <div className="collapse-core" id="collapse-core" />

                {[0, 1, 2, 3].map((i) => (
                  <div className={`otp-node otp-node--${i}`} data-index={i} key={i}>
                    <svg className="node-trace" viewBox="0 0 100 100" aria-hidden="true">
                      <rect className="node-trace-path" x="2" y="2" width="96" height="96" rx="18" ry="18" pathLength={100} />
                    </svg>
                    <div className="node-face">
                      <span className="node-sheen" />
                      <span className="digit" />
                      <span className="custom-caret" />
                    </div>
                  </div>
                ))}
              </div>

              <p className="demo-note" id="demo-note">
                Código de demonstração: <span className="demo-code">1234</span>
              </p>

              <p className="otp-feedback" id="otp-feedback">
                Não recebeu?{" "}
                <button className="resend-button" id="resend-button" type="button" disabled>
                  Reenviar em <span id="resend-time">0:24</span>
                </button>
              </p>
            </div>
          </form>

          <div className="success-view" id="success-view" aria-hidden="true" hidden>
            <div className="success-art" aria-hidden="true">
              <div className="success-square">
                <svg className="success-trace" viewBox="0 0 100 100" aria-hidden="true">
                  <rect className="success-trace-path" x="2" y="2" width="96" height="96" rx="22" ry="22" pathLength={100} />
                </svg>
                <span className="checkmark">
                  <i className="check-stroke check-stroke--short" />
                  <i className="check-stroke check-stroke--long" />
                </span>
              </div>
            </div>

            <div className="trust-badge">
              <span className="badge-check" aria-hidden="true">✓</span>
              <span>Verificado e seguro</span>
            </div>

            <button className="continue-button" id="continue-button" type="button">
              <span>Continuar</span>
              <i aria-hidden="true">→</i>
            </button>
          </div>
        </div>

        <p className="sr-only" id="status-live" aria-live="polite" aria-atomic="true" />
      </section>
    </div>
  );
}
