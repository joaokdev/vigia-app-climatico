"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { OTPInput } from "@/components/ui/OTPInput";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/icons";

const DEMO_CODE = "1234";
const RESEND_SECONDS = 24;

export default function VerificarOtpPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  function handleComplete(code: string) {
    setStatus("verifying");
    setAnnouncement("Verificando código.");
    setTimeout(() => {
      if (code === DEMO_CODE) {
        setStatus("success");
        setAnnouncement("Código verificado com sucesso.");
      } else {
        setStatus("error");
        setAnnouncement("Código incorreto. Tente novamente.");
        setTimeout(() => setStatus("idle"), 500);
      }
    }, 700);
  }

  function handleResend() {
    setSecondsLeft(RESEND_SECONDS);
    setAnnouncement("Um novo código de demonstração foi reenviado.");
  }

  return (
    <AuthShell
      title="Verifique seu e-mail"
      subtitle="Digite o código de 4 dígitos que enviamos para você."
    >
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === "success" ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-success-soft)] text-[color:var(--color-success)]">
            <IconCheck size={22} />
          </span>
          <p className="text-sm font-medium text-[color:var(--color-text)]">Conta verificada</p>
          <p className="text-xs text-[color:var(--color-text-subtle)]">
            Implementado visualmente como mock para a FASE 1 — validação real
            de OTP, expiração e limite de tentativas chegam na FASE 2.
          </p>
          <Button fullWidth onClick={() => router.push("/")}>
            Continuar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <OTPInput length={4} onComplete={handleComplete} status={status} />

          {status === "error" && (
            <p role="alert" className="text-sm text-[color:var(--color-danger)]">
              Código incorreto. Use <span className="font-data">1234</span> nesta demonstração.
            </p>
          )}

          <p className="text-center text-xs text-[color:var(--color-text-subtle)]">
            Código de demonstração da FASE 1: <span className="font-data">1234</span>
          </p>

          <div className="text-sm text-[color:var(--color-text-muted)]">
            {secondsLeft > 0 ? (
              <span>Reenviar código em {secondsLeft}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-[color:var(--color-interactive)] hover:underline"
              >
                Reenviar código
              </button>
            )}
          </div>
        </div>
      )}
    </AuthShell>
  );
}
