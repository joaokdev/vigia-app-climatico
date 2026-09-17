"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasSession, isPublicRoute } from "@/lib/auth/session";

/**
 * O `authGateInitScript` no <head> cobre carregamentos completos de
 * documento (primeira visita, refresh, link externo). Navegações
 * feitas por <Link>/router do Next são client-side e não passam pelo
 * <head> de novo — este componente é a rede de segurança para esse
 * caso, verificando a sessão a cada troca de rota.
 */
export function AuthGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isPublicRoute(pathname)) return;
    if (!hasSession()) {
      router.replace("/login");
    }
  }, [pathname, router]);

  return null;
}
