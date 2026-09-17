import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/lib/theme/theme-provider";
import { authGateInitScript } from "@/lib/auth/session";
import { AuthGate } from "@/components/auth/AuthGate";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";

export const metadata: Metadata = {
  title: {
    default: "VIGIA — Clima sempre a frente",
    template: "%s · VIGIA",
  },
  description:
    "Central regional de monitoramento ambiental para União da Vitória, Cruz Machado, Bituruna e Inácio Martins: clima, chuva, rios e alertas em tempo real.",
  metadataBase: new URL("https://vigia.example.com"),
  openGraph: {
    title: "VIGIA — Clima sempre a frente",
    description:
      "Monitoramento ambiental regional: clima, hidrologia e alertas para a região de União da Vitória.",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Executa antes da hidratação para eliminar flash de tema errado */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Login/cadastro obrigatórios (mock de sessão, FASE 1) — redireciona
            antes da hidratação para não piscar conteúdo protegido. */}
        <script dangerouslySetInnerHTML={{ __html: authGateInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <AuthGate />
          <a
            href="#conteudo-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-[var(--radius-md)] focus:bg-[color:var(--color-interactive)] focus:px-4 focus:py-2 focus:text-[color:var(--color-on-accent)]"
          >
            Pular para o conteúdo principal
          </a>
          <Header />
          <main id="conteudo-principal" className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
