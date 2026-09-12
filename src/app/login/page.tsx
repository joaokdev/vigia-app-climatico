"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input, PasswordField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/icons";

export default function LoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("done"), 900);
  }

  return (
    <AuthShell
      title="Entrar no VIGIA"
      subtitle="Acompanhe o clima e os rios da sua região."
      footer={
        <span className="text-[color:var(--color-text-muted)]">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-[color:var(--color-interactive)] hover:underline">
            Criar conta
          </Link>
        </span>
      }
    >
      {status === "done" ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-success-soft)] text-[color:var(--color-success)]">
            <IconCheck size={22} />
          </span>
          <p className="text-sm font-medium text-[color:var(--color-text)]">
            Fluxo visual de login concluído
          </p>
          <p className="text-xs text-[color:var(--color-text-subtle)]">
            Implementado visualmente como mock para a FASE 1 — nenhuma
            autenticação real foi realizada. A verificação de credenciais e a
            criação de sessão chegam na FASE 2.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            required
          />
          <PasswordField
            label="Senha"
            name="password"
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end">
            <Link
              href="/recuperar-acesso"
              className="text-xs font-medium text-[color:var(--color-interactive)] hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Button type="submit" fullWidth loading={status === "loading"}>
            Entrar
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
