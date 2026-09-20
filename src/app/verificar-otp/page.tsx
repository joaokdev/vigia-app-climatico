"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { OtpVerificationCard } from "@/components/effects/otp-verification/OtpVerificationCard";

declare global {
  interface Window {
    __vigiaVerifyOtp?: (code: string) => Promise<boolean>;
  }
}

function VerificarOtpInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const purpose = searchParams.get("purpose") === "password_reset" ? "password_reset" : "email_verification";

  useEffect(() => {
    if (!email) return;

    window.__vigiaVerifyOtp = async (code: string) => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose }),
      });
      if (!res.ok) return false;

      const body = await res.json();
      if (body.kind === "reset_token") {
        // Guardado só na memória da aba (sessionStorage), nunca na URL —
        // um resetToken vazado por histórico/log de servidor teria 10 min
        // de validade para redefinir a senha de alguém.
        window.sessionStorage.setItem("vigia:reset-token", body.resetToken);
      }
      return true;
    };

    function onVerified() {
      window.setTimeout(() => {
        if (purpose === "password_reset") {
          router.push("/recuperar-acesso/nova-senha");
        } else {
          router.push("/");
          router.refresh();
        }
      }, 900);
    }
    window.addEventListener("vigia:otp-verified", onVerified);
    return () => {
      window.removeEventListener("vigia:otp-verified", onVerified);
      delete window.__vigiaVerifyOtp;
    };
  }, [email, purpose, router]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" aria-label="VIGIA — página inicial">
        <Logo size={44} />
      </Link>
      {!email ? (
        <p className="max-w-xs text-center text-sm text-[color:var(--color-danger)]">
          Não sabemos qual e-mail verificar. Volte e tente de novo.
        </p>
      ) : (
        <OtpVerificationCard />
      )}
    </div>
  );
}

export default function VerificarOtpPage() {
  // useSearchParams exige um limite de Suspense no App Router.
  return (
    <Suspense fallback={null}>
      <VerificarOtpInner />
    </Suspense>
  );
}
