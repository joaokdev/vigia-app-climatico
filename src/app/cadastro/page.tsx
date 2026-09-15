"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthVault } from "@/components/effects/password-strength/PasswordStrengthVault";
import { Button } from "@/components/ui/Button";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // FASE 1: sem backend real. Simula o passo "envio de OTP" e navega
    // para a tela de verificação, que é onde o fluxo visual continua.
    setTimeout(() => {
      router.push("/verificar-otp?origem=cadastro");
    }, 700);
  }

  return (
    <AuthShell
      title="Criar conta no VIGIA"
      subtitle="Receba um código de verificação por e-mail para continuar."
      footer={
        <span className="text-[color:var(--color-text-muted)]">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-[color:var(--color-interactive)] hover:underline">
            Entrar
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Nome" name="name" autoComplete="name" required />
        <Input label="E-mail" type="email" name="email" autoComplete="email" required />
        <div className="mt-1 rounded-[var(--radius-lg)] bg-[color:var(--color-surface-sunken)] p-2.5">
          <PasswordStrengthVault />
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Continuar
        </Button>
        <p className="text-center text-[11px] text-[color:var(--color-text-subtle)]">
          Implementado visualmente como mock para a FASE 1 — cadastro real,
          hashing de senha e criação de conta chegam na FASE 2.
        </p>
      </form>
    </AuthShell>
  );
}
