import { env } from "../lib/env";

/**
 * Adapter para a NVIDIA NIM (build.nvidia.com), endpoint hospedado
 * OpenAI-compatível — não é um SDK próprio, é `fetch` puro contra
 * `/chat/completions`, então trocar de provider de IA no futuro é
 * trocar este arquivo, não reescrever quem o chama (mesmo princípio
 * de desacoplamento já usado para clima/rio/alertas).
 *
 * Documentação consultada: a NVIDIA expõe o catálogo de modelos
 * hospedados (Llama, Mixtral, Nemotron, etc.) em
 * https://integrate.api.nvidia.com/v1/chat/completions, schema igual
 * ao da OpenAI Chat Completions API. Chave obtida em build.nvidia.com
 * (developer program, gratuito), formato `nvapi-...`.
 *
 * IMPORTANTE (transparência): assim como o adapter da Open-Meteo, este
 * código não pôde ser testado contra a API ao vivo neste ambiente de
 * desenvolvimento (rede do sandbox não alcança integrate.api.nvidia.com).
 * Validar com uma chave real antes de confiar em produção.
 */

type ChatMessage = { role: "system" | "user"; content: string };

export type NvidiaResult =
  | { ok: true; text: string; model: string }
  | { ok: false; reason: "sem-chave" | "falha" | "timeout" };

export async function generateWithNvidia(
  messages: ChatMessage[],
  { maxTokens = 220, temperature = 0.3 }: { maxTokens?: number; temperature?: number } = {}
): Promise<NvidiaResult> {
  if (!env.NVIDIA_API_KEY) {
    return { ok: false, reason: "sem-chave" };
  }

  const url = `${env.NVIDIA_BASE_URL}/chat/completions`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.NVIDIA_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: false,
      }),
      // A geração de um insight curto não deve travar a página caso a
      // NVIDIA esteja lenta — falha controlada, sem dado inventado no
      // lugar (ver server/ai/insight.ts).
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    return { ok: false, reason: "timeout" };
  }

  if (!res.ok) {
    return { ok: false, reason: "falha" };
  }

  type NvidiaResponse = {
    choices?: { message?: { content?: string } }[];
  };
  const data = (await res.json()) as NvidiaResponse;
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    return { ok: false, reason: "falha" };
  }

  return { ok: true, text, model: env.NVIDIA_MODEL };
}
