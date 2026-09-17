"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { OtpVerificationCard } from "@/components/effects/otp-verification/OtpVerificationCard";
import { markAuthenticated } from "@/lib/auth/session";

export default function VerificarOtpPage() {
  const router = useRouter();

  useEffect(() => {
    function onVerified() {
      // FASE 1: mock — o código "real" seria validado no backend na FASE 2.
      // Aqui, confirmar o OTP é o que libera a sessão mock do app.
      markAuthenticated();
      window.setTimeout(() => router.push("/"), 900);
    }
    window.addEventListener("vigia:otp-verified", onVerified);
    return () => window.removeEventListener("vigia:otp-verified", onVerified);
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" aria-label="VIGIA — página inicial">
        <Logo size={44} />
      </Link>
      <OtpVerificationCard />
      <p className="max-w-xs text-center text-[11px] text-[color:var(--color-text-subtle)]">
        Implementado visualmente como mock para a FASE 1 — validação real de
        OTP, expiração e limite de tentativas chegam na FASE 2.
      </p>
    </div>
  );
}
