"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/icons";

export default function RecuperarAcessoPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("done"), 800);
  }

  return (
    <AuthShell
      title="Recuperar acesso"
      subtitle="Enviaremos um código para redefinir sua senha."
      footer={
        <Link href="/login" className="font-medium text-[color:var(--color-interactive)] hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {status === "done" ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center" role="status">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-info-soft)] text-[color:var(--color-info)]">
            <IconCheck size={22} />
          </span>
          <p className="text-sm font-medium text-[color:var(--color-text)]">
            Se o e-mail existir, enviaremos instruções
          </p>
          <p className="text-xs text-[color:var(--color-text-subtle)]">
            Resposta neutra por padrão — não revela se um e-mail está
            cadastrado. Implementado visualmente como mock para a FASE 1.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="E-mail da conta"
            type="email"
            name="email"
            autoComplete="email"
            required
          />
          <Button type="submit" fullWidth loading={status === "loading"}>
            Enviar instruções
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
