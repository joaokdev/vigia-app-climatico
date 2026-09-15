"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { IconMenu, IconNotification } from "@/components/icons";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/", label: "Painel" },
  { href: "/mapa", label: "Mapa" },
  { href: "/sobre", label: "Sobre" },
  { href: "/fontes", label: "Fontes" },
];

export function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[var(--z-header)] border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 backdrop-blur-sm">
      <div className="vigia-container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="VIGIA — página inicial">
          <Logo size={60} />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-[background-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-95",
                  isActive
                    ? "text-[color:var(--color-text)] bg-[color:var(--color-surface-sunken)]"
                    : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-sunken)]/60 hover:text-[color:var(--color-text)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Abaixo de md, notificação/tema/entrar/criar-conta saem da barra —
            eles competiam visualmente com o hambúrguer na faixa 640–767px
            (apareciam junto, já que antes usavam o breakpoint sm enquanto
            o hambúrguer só sumia em md). Agora um único breakpoint (md)
            decide "modo desktop" vs "modo mobile" no Header inteiro, sem
            zona intermediária espremida. No mobile, tudo isso mora só no
            Drawer. */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>
          {/* Envolvido num <div> em vez de passar "hidden md:inline-flex"
              direto pro IconButton: o IconButton já inclui "inline-flex"
              fixo nas próprias classes-base, e no CSS gerado essa classe
              incondicional vem depois de ".hidden" — ou seja, o botão
              nunca ficava de fato escondido em nenhuma largura, era só
              aparência de responsivo. Esse era o motivo real do sino de
              notificação aparecer competindo com o hambúrguer em telas
              pequenas (não só a faixa 640–767px — em qualquer mobile). */}
          <div className="hidden md:inline-flex">
            <IconButton label="Notificações" size="sm">
              <IconNotification size={17} />
            </IconButton>
          </div>
          <Link href="/login" className="hidden md:block">
            <Button variant="secondary" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro" className="hidden md:block">
            <Button variant="primary" size="sm">
              Criar conta
            </Button>
          </Link>
          <IconButton
            label="Abrir menu"
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <IconMenu size={18} />
          </IconButton>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu VIGIA">
        <nav aria-label="Navegação (móvel)" className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "rounded-[var(--radius-md)] px-3.5 py-3 text-[15px] font-medium transition-colors duration-[var(--duration-fast)] active:scale-[0.98]",
                  isActive
                    ? "bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]"
                    : "text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-sunken)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="my-3 border-t border-[color:var(--color-border)]" />

          <button
            type="button"
            className="flex items-center justify-between rounded-[var(--radius-md)] px-3.5 py-3 text-[15px] font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-sunken)]"
          >
            Notificações
            <IconNotification size={17} className="text-[color:var(--color-text-subtle)]" />
          </button>

          <div className="my-3 border-t border-[color:var(--color-border)]" />

          <Link
            href="/login"
            onClick={() => setDrawerOpen(false)}
            className="rounded-[var(--radius-md)] px-3.5 py-3 text-[15px] font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-sunken)]"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            onClick={() => setDrawerOpen(false)}
            className="mt-1 rounded-[var(--radius-md)] bg-[color:var(--color-interactive)] px-3.5 py-3 text-center text-[15px] font-semibold text-[color:var(--color-on-accent)]"
          >
            Criar conta
          </Link>

          <div className="my-3 border-t border-[color:var(--color-border)]" />
          <span className="px-3.5 text-xs font-medium text-[color:var(--color-text-subtle)]">Tema</span>
          <div className="px-3.5 py-2">
            <ThemeSwitcher />
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
