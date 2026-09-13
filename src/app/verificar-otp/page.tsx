"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { OtpVerificationCard } from "@/components/effects/otp-verification/OtpVerificationCard";

export default function VerificarOtpPage() {
  const router = useRouter();

  useEffect(() => {
    function onVerified() {
      window.setTimeout(() => router.push("/"), 900);
    }
    window.addEventListener("vigia:otp-verified", onVerified);
    return () => window.removeEventListener("vigia:otp-verified", onVerified);
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6 px-4 py-12">
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
