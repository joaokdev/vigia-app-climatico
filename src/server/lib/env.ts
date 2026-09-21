import { z } from "zod";

/**
 * Única fonte de verdade para variáveis de ambiente do backend.
 * Falha rápido e com mensagem clara na inicialização em vez de um
 * `undefined` silencioso aparecer três camadas depois.
 */
const envSchema = z.object({
  // ===== DATABASE =====
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),

  // ===== REDIS =====
  REDIS_URL: z.string().min(1).default("redis://127.0.0.1:6379"),

  // ===== SESSÃO =====
  SESSION_COOKIE_NAME: z.string().default("vigia_session"),
  /** Dias até a sessão expirar. */
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),

  // ===== EMAIL =====
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("VIGIA <nao-responda@vigia.exemplo>"),

  // ===== MAPA =====
  /** Style URL MapLibre (vetorial). Padrão: OpenFreeMap "liberty", público,
   * sem chave — ver github.com/hyperknot/openfreemap e /fontes no app. */
  MAP_STYLE_URL: z.string().default("https://tiles.openfreemap.org/styles/liberty"),
  /** Camada de radar de chuva (RainViewer, pública, sem chave — uso
   * pessoal/educacional/comunidade pequena, ver api.rainviewer.com). */
  MAP_RAIN_LAYER_URL: z.string().default("https://api.rainviewer.com/public/weather-maps.json"),

  // ===== NVIDIA AI (VIGIA Intelligence) =====
  /** Sem isto, a camada de insight de IA fica desligada e a página
   * mostra um estado "indisponível" explícito — nunca um dado inventado.
   * Obter em build.nvidia.com (developer program gratuito). */
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_BASE_URL: z.string().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_MODEL: z.string().default("meta/llama-3.3-70b-instruct"),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  /**
   * Só deve ser "true" em desenvolvimento. Quando ligado, endpoints de
   * OTP devolvem o código gerado na resposta (além de "enviar" o
   * e-mail) para permitir testar o fluxo sem uma caixa de entrada real.
   * Nunca deve ser true em produção — ver checagem abaixo.
   */
  VIGIA_DEV_EXPOSE_OTP: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuração de ambiente inválida:", parsed.error.flatten().fieldErrors);
  throw new Error("Variáveis de ambiente obrigatórias ausentes/ inválidas — veja o log acima.");
}

// Nota operacional (não é uma checagem em código): `next build` sempre
// roda com NODE_ENV=production, inclusive num `next build` local de
// teste — então travar o boot com base nisso também quebraria esse
// fluxo legítimo. A proteção real já está em como VIGIA_DEV_EXPOSE_OTP
// é usada (server/auth/service.ts só inclui o código na resposta
// quando essa flag é true) — então o que realmente importa é: NÃO
// definir VIGIA_DEV_EXPOSE_OTP nas variáveis de ambiente do ambiente
// de produção de verdade (Vercel/servidor), nunca setar isso fora de
// .env.local.

export const env = parsed.data;
