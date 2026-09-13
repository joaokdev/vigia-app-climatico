"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconAccount, IconNotification, IconSettings } from "@/components/icons";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/conta", label: "Perfil", icon: IconAccount },
  { href: "/conta/preferencias", label: "Preferências", icon: IconSettings },
  { href: "/conta/notificacoes", label: "Notificações", icon: IconNotification },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="vigia-container flex flex-col gap-6 py-8 md:flex-row md:gap-10">
      <nav
        aria-label="Navegação da conta"
        className="flex gap-1 overflow-x-auto md:w-52 md:flex-col md:overflow-visible"
      >
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-[background-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] active:scale-[0.97]",
                isActive
                  ? "bg-[color:var(--color-accent-soft)] text-[color:var(--color-interactive)]"
                  : "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-sunken)] hover:text-[color:var(--color-text)]"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1">{children}</div>
    </div>
  );
}
