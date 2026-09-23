import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/lib/theme/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
        {/* Proteção de rotas: agora feita no servidor via src/middleware.ts,
            que roda antes de qualquer HTML ser enviado — cobre navegação
            completa e client-side sem precisar de script/flash-guard aqui. */}
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <a
            href="#conteudo-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-[var(--radius-md)] focus:bg-[color:var(--color-interactive)] focus:px-4 focus:py-2 focus:text-[color:var(--color-on-accent)]"
          >
            Pular para o conteúdo principal
          </a>
          <Header />
          {/* Transição global de página ("Glob Wipe") removida por
              pedido explícito da ATUALIZACAO_DO_VIGIA.md §17 —
              PageTransition.tsx foi removido do repositório por não
              ter mais nenhum uso (nenhuma outra transição global foi
              colocada no lugar). */}
          <main id="conteudo-principal" className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
