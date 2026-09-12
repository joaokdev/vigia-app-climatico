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
      <div className="vigia-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="VIGIA — página inicial">
          <Logo size={36} />
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
                  "rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-[color:var(--color-text)] bg-[color:var(--color-surface-sunken)]"
                    : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>
          <IconButton label="Notificações" size="sm" className="hidden sm:inline-flex">
            <IconNotification size={17} />
          </IconButton>
          <Link href="/login" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro" className="hidden sm:block">
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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-sunken)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="my-3 border-t border-[color:var(--color-border)]" />
          <Link
            href="/login"
            onClick={() => setDrawerOpen(false)}
            className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-sunken)]"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            onClick={() => setDrawerOpen(false)}
            className="rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-sunken)]"
          >
            Criar conta
          </Link>
          <div className="my-3 border-t border-[color:var(--color-border)]" />
          <span className="px-3 text-xs font-medium text-[color:var(--color-text-subtle)]">Tema</span>
          <div className="px-3 py-2">
            <ThemeSwitcher />
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
