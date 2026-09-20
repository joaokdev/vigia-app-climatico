import { z } from "zod";

// Mesma régua usada pelo Vault no front (ver PasswordStrengthVault):
// não duplicamos a lógica de "força" aqui, só o piso absoluto que o
// backend nunca aceita, independente do que a UI validou.
export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("E-mail inválido");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: z.string().length(4).regex(/^\d{4}$/, "Código deve ter 4 dígitos"),
  purpose: z.enum(["email_verification", "password_reset"]),
});

export const resendOtpSchema = z.object({
  email: emailSchema,
  purpose: z.enum(["email_verification", "password_reset"]),
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: passwordSchema,
});
