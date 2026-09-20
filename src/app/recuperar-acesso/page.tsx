"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RecuperarAcessoPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const email = String(new FormData(e.currentTarget).get("email") ?? "");

    // Resposta sempre neutra (200, sem indicar se o e-mail existe) —
    // por isso seguimos para a tela de código de qualquer forma: se a
    // conta não existir, o próximo passo (verificar-otp) simplesmente
    // rejeitará qualquer código digitado, sem vazar mais informação
    // do que isso.
    await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    router.push(`/verificar-otp?email=${encodeURIComponent(email)}&purpose=password_reset`);
  }

  return (
    <AuthShell
      title="Recuperar acesso"
      subtitle="Enviaremos um código para redefinir sua senha, se o e-mail estiver cadastrado."
      footer={
        <Link href="/login" className="font-medium text-[color:var(--color-interactive)] hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="E-mail da conta"
          type="email"
          name="email"
          autoComplete="email"
          required
        />
        <Button type="submit" size="lg" fullWidth loading={status === "loading"}>
          Enviar código
        </Button>
      </form>
    </AuthShell>
  );
}
