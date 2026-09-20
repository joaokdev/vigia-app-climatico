import { Resend } from "resend";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Sem RESEND_API_KEY configurada (todo ambiente de desenvolvimento
 * até hoje, já que não temos uma conta/domínio verificado ainda), o
 * e-mail não é enviado de verdade — só registrado no log do servidor.
 * Isto é intencional e visível (nunca falha silenciosamente fingindo
 * que enviou): quem estiver testando o fluxo de cadastro/recuperação
 * lê o código no terminal onde `next dev`/`next start` está rodando.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ delivered: boolean }> {
  if (!resendClient) {
    logger.warn("email não enviado — RESEND_API_KEY não configurada (fallback de dev)", {
      to: input.to,
      subject: input.subject,
    });
    if (env.NODE_ENV !== "production") {
      console.warn(`  Corpo (texto): ${input.text}`);
    }
    return { delivered: false };
  }

  const result = await resendClient.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (result.error) {
    // Erro real do provedor — não escondido: quem chamou decide como
    // reagir (ex: ainda assim responder 200 neutro para o usuário,
    // mas logar como falha de infraestrutura).
    logger.error("falha ao enviar e-mail via Resend", { to: input.to, error: result.error });
    return { delivered: false };
  }

  return { delivered: true };
}

export function otpEmailContent(code: string, purpose: "email_verification" | "password_reset") {
  const isReset = purpose === "password_reset";
  const subject = isReset
    ? "Código para redefinir sua senha — VIGIA"
    : "Confirme seu e-mail — VIGIA";
  const intro = isReset
    ? "Use o código abaixo para redefinir sua senha."
    : "Use o código abaixo para confirmar seu e-mail.";
  const text = `${intro}\n\nCódigo: ${code}\n\nEle expira em ${10} minutos. Se você não pediu isso, ignore este e-mail.`;
  const html = `
    <div style="font-family: system-ui, sans-serif; color: #10171a;">
      <p>${intro}</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p style="color: #4d5c60; font-size: 13px;">Expira em 10 minutos. Se você não pediu isso, ignore este e-mail.</p>
    </div>
  `;
  return { subject, text, html };
}
