/**
 * Sessão real (FASE 2) — o cookie httpOnly em si nunca é lido no
 * cliente (por segurança); estas funções só conversam com os
 * endpoints que sabem verificá-lo no servidor. A proteção de rota em
 * si (redirecionar quem não tem sessão) está em src/middleware.ts,
 * não aqui — este arquivo é só para os componentes de UI que
 * precisam saber "quem está logado" ou "me desloga".
 */

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  favoriteRegionSlug: string | null;
  preferences: { temperatureUnit: "celsius" | "fahrenheit"; windUnit: "kmh" | "ms" };
  notificationChannels: { push: boolean; email: boolean; sms: boolean };
  memberSince: string;
};

export const PUBLIC_ROUTES = ["/login", "/cadastro", "/verificar-otp", "/recuperar-acesso"];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

/** Retorna o usuário logado, ou null se não houver sessão válida. */
export async function fetchCurrentUser(): Promise<PublicUser | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const body = await res.json();
    return body.user as PublicUser;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {
    // Mesmo se a chamada falhar (rede etc.), a UI ainda navega para o
    // login — o pior caso é o cookie continuar válido até expirar
    // sozinho, não um usuário preso numa tela quebrada.
  });
}
