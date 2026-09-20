"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/icons";

function readAndConsumeResetToken(): string | null {
  // Ver verificar-otp/page.tsx: o token fica só em sessionStorage, nunca
  // na URL — lido uma vez e removido aqui; reutilizar depois não teria
  // efeito de qualquer forma (o backend apaga o token no primeiro uso).
  // Este componente só roda no cliente (ver page.tsx, dynamic ssr:false),
  // então window sempre existe aqui.
  const value = window.sessionStorage.getItem("vigia:reset-token");
  window.sessionStorage.removeItem("vigia:reset-token");
  return value;
}

export default function NovaSenhaClient() {
  const router = useRouter();
  const [token] = useState<string | null>(readAndConsumeResetToken);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Sessão de verificação expirada. Peça a recuperação novamente.");
      return;
    }

    const newPassword = String(new FormData(e.currentTarget).get("password") ?? "");
    if (newPassword.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setStatus("loading");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken: token, newPassword }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error?.message ?? "Não foi possível redefinir a senha.");
      setStatus("idle");
      return;
    }

    setStatus("done");
    window.setTimeout(() => router.push("/login"), 1500);
  }

  if (token === null) {
    return (
      <AuthShell title="Link expirado" subtitle="Peça a recuperação de senha novamente.">
        <Button fullWidth onClick={() => router.push("/recuperar-acesso")}>
          Voltar para recuperar acesso
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Defina uma nova senha" subtitle="Escolha uma senha com pelo menos 8 caracteres.">
      {status === "done" ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center" role="status">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-success-soft)] text-[color:var(--color-success)]">
            <IconCheck size={22} />
          </span>
          <p className="text-sm font-medium text-[color:var(--color-text)]">Senha redefinida</p>
          <p className="text-xs text-[color:var(--color-text-subtle)]">Levando você para o login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <PasswordField label="Nova senha" name="password" autoComplete="new-password" required />
          {error && (
            <p role="alert" className="text-sm text-[color:var(--color-danger)]">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" fullWidth loading={status === "loading"}>
            Redefinir senha
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
