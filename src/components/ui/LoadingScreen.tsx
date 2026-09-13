"use client";

import { useEffect, useState } from "react";

/**
 * Tela de carregamento própria do VIGIA — NÃO é um efeito de
 * terceiro portado. O pacote "cool-loading-screens" foi avaliado
 * (5 variantes: halterofilista, hambúrguer, xícara de café, sapo,
 * bala) e nenhuma delas combina com o tom sério de uma ferramenta
 * de monitoramento de risco/enchente — usá-las sem alteração
 * pareceria fora de lugar num painel de alerta.
 *
 * O VIGIA_MASTER_PROMPT.md já antecipa esse tipo de tensão e pede
 * explicitamente que o pacote seja "analisado e reduzido/adaptado
 * ao sistema de loading do VIGIA", não usado literalmente. Este
 * componente é essa adaptação: em vez de um personagem brincalhão,
 * um pluviômetro (instrumento real de medição de chuva) se enche
 * gradualmente — a mesma ideia geral de "preenchimento com
 * progresso" do pacote original, mas desenhada do zero com a
 * identidade visual do VIGIA.
 */
const STATUS_MESSAGES = [
  "Sincronizando estações...",
  "Consultando níveis de rio...",
  "Carregando dados regionais...",
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(8);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + (92 - p) * 0.18 + 1));
    }, 220);
    const statusTimer = window.setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1400);
    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(statusTimer);
    };
  }, []);

  const fillY = 46 - (progress / 100) * 34;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <svg width="72" height="88" viewBox="0 0 72 88" aria-hidden="true">
        <defs>
          <clipPath id="vigia-gauge-clip">
            <path d="M20 10h32l4 8-16 58a4 4 0 0 1-8 0L16 18Z" />
          </clipPath>
        </defs>
        <path
          d="M20 10h32l4 8-16 58a4 4 0 0 1-8 0L16 18Z"
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="2"
        />
        <g clipPath="url(#vigia-gauge-clip)">
          <rect
            x="10"
            y={fillY}
            width="52"
            height="60"
            fill="var(--color-accent)"
            opacity="0.35"
            style={{ transition: "y 300ms var(--ease-standard)" }}
          />
          <rect
            x="10"
            y={fillY - 1.5}
            width="52"
            height="3"
            fill="var(--color-accent)"
            style={{ transition: "y 300ms var(--ease-standard)" }}
          />
        </g>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="24"
            x2="27"
            y1={18 + i * 13}
            y2={18 + i * 13}
            stroke="var(--color-border-strong)"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <p className="font-data text-sm text-[color:var(--color-text-muted)]">
        {Math.round(progress)}%
      </p>
      <p className="text-sm text-[color:var(--color-text-subtle)]" role="status" aria-live="polite">
        {STATUS_MESSAGES[statusIndex]}
      </p>
    </div>
  );
}
