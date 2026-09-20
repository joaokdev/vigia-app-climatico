"use client";

import dynamic from "next/dynamic";

// Esta página lê um token de curta duração salvo em sessionStorage
// (ver verificar-otp/page.tsx) — dado que só existe no navegador, então
// desativamos SSR aqui para não ter estado divergente entre servidor e
// cliente na primeira renderização.
const NovaSenhaClient = dynamic(() => import("./NovaSenhaClient"), { ssr: false });

export default function NovaSenhaPage() {
  return <NovaSenhaClient />;
}
