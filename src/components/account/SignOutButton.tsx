"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { clearSession } from "@/lib/auth/session";

export function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    // FASE 1: só limpa a sessão mock local — não existe token/servidor
    // envolvido ainda. Isso fecha o ciclo do login obrigatório, para dar
    // pra testar o fluxo de novo sem precisar limpar o localStorage à mão.
    clearSession();
    router.push("/login");
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut}>
      Sair
    </Button>
  );
}
