"use client";

import { IconMoon, IconSun, IconSystem } from "@/components/icons";
import { useTheme, type ThemePreference } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/cn";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof IconSun }[] = [
  { value: "light", label: "Claro", icon: IconSun },
  { value: "system", label: "Sistema", icon: IconSystem },
  { value: "dark", label: "Escuro", icon: IconMoon },
];

/**
 * Alternador de tema com três posições. A ideia de "janela dia/noite"
 * do efeito de referência é preservada apenas como princípio (o
 * controle comunica visualmente qual estado está ativo através de
 * ícone + realce), sem reutilizar a implementação original.
 */
export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema da interface"
      className="inline-flex items-center gap-0.5 rounded-[var(--radius-full)] border border-[color:var(--color-border)] p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Tema ${label}`}
            title={label}
            onClick={() => setPreference(value)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] transition-[background-color,color,transform] duration-[var(--duration-base)] ease-[var(--ease-standard)] active:scale-90",
              selected
                ? "bg-[color:var(--color-interactive)] text-[color:var(--color-on-accent)]"
                : "text-[color:var(--color-text-subtle)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-text)]"
            )}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
