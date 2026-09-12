"use client";

import Image from "next/image";
import { useTheme } from "@/lib/theme/theme-provider";

/**
 * Componente centralizado de marca.
 *
 * Regra de negócio (fixa, ver VIGIA_MASTER_PROMPT):
 *  - Light  -> /brand/logo-black.png
 *  - Dark   -> /brand/logo-white.png
 *
 * Os arquivos são os originais fornecidos pelo proprietário
 * (PNG RGBA 1254x1254) e NUNCA são redesenhados, deformados ou
 * substituídos por uma versão gerada. Nenhum outro componente do
 * VIGIA deve decidir qual arquivo de logo usar — toda a lógica
 * fica centralizada aqui.
 */
export function Logo({
  size = 40,
  withWordmark = false,
  className,
}: {
  size?: number;
  /** A logo já contém o wordmark "vigia"; use withWordmark apenas
   * se quiser reforçar o nome tipograficamente ao lado. */
  withWordmark?: boolean;
  className?: string;
}) {
  const { resolved } = useTheme();
  const src = resolved === "dark" ? "/brand/logo-white.png" : "/brand/logo-black.png";

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src={src}
        alt="VIGIA"
        width={size}
        height={size}
        priority
        unoptimized
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      {withWordmark && (
        <span
          className="font-semibold tracking-tight text-[color:var(--color-text)]"
          style={{ fontSize: size * 0.42 }}
        >
          VIGIA
        </span>
      )}
    </span>
  );
}
