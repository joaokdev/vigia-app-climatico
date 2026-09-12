"use client";

import { useMemo } from "react";

type Tier = {
  label: string;
  color: string;
};

const TIERS: Tier[] = [
  { label: "Muito fraca", color: "var(--color-danger)" },
  { label: "Fraca", color: "var(--color-warning)" },
  { label: "Razoável", color: "var(--color-warning)" },
  { label: "Forte", color: "var(--color-success)" },
  { label: "Muito forte", color: "var(--color-success)" },
];

/**
 * Estimativa simples de robustez de senha (não é o algoritmo de
 * entropia do pacote de referência — reimplementado para o VIGIA).
 * Considera: comprimento, variedade de classes de caractere e
 * repetição/sequência óbvia.
 */
function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  score += Math.min(password.length / 4, 4);
  score += classes;

  if (/(.)\1\1/.test(password)) score -= 1.5; // repetição
  if (/^(123|abc|senha|password|qwerty)/i.test(password)) score -= 2;

  return Math.max(0, Math.min(score, 8));
}

export function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);
  const tierIndex = Math.min(4, Math.floor((score / 8) * 5));
  const tier = TIERS[tierIndex];

  if (!password) return null;

  return (
    <div className="mt-2 flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1" role="presentation">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-[var(--duration-base)]"
            style={{
              background:
                i <= tierIndex ? tier.color : "var(--color-border)",
            }}
          />
        ))}
      </div>
      <p className="text-xs text-[color:var(--color-text-subtle)]">
        Força da senha: <span style={{ color: tier.color }}>{tier.label}</span>
      </p>
    </div>
  );
}
