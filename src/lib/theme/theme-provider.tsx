"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "vigia:theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

/**
 * Script inline executado antes da hidratação para eliminar
 * flash de tema incorreto (FOUC). Lido pelo <head> no layout raiz.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var pref = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-pref', pref);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Inicializadores preguiçosos: leem localStorage/matchMedia uma vez,
  // sem precisar de um efeito que dispare setState em cascata.
  const [preference, setPreferenceState] = useState<ThemePreference>(
    readStoredPreference
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Apenas se inscreve em um sistema externo (matchMedia); o setState
  // ocorre dentro do callback do listener, não no corpo do efeito.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const resolved = useMemo<ResolvedTheme>(
    () => (preference === "system" ? systemTheme : preference),
    [preference, systemTheme]
  );

  // Sincroniza o DOM com o estado React já calculado — nenhum
  // setState acontece aqui, apenas efeito colateral sobre o DOM.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-pref", preference);
  }, [resolved, preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    window.localStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
