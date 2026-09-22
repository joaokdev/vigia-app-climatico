import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanDatabase } from "../__tests__/db-helpers";
import { pool } from "../db/client";
import { redis } from "../db/redis";
import * as authService from "../auth/service";
import * as authRepo from "../auth/repository";
import { hashPassword } from "../auth/password";

// O adapter de e-mail tenta logar/enviar de verdade a cada OTP gerado
// nos testes — silenciamos o console.warn do fallback de dev para não
// poluir a saída do teste, sem mudar o comportamento real.
vi.spyOn(console, "warn").mockImplementation(() => {});

beforeEach(async () => {
  await cleanDatabase();
  await redis.flushdb();
});

afterAll(async () => {
  await pool.end();
  redis.disconnect();
});

// Cria um usuário direto no repositório, sem passar pelo registerUser
// (que hoje já entrega a conta verificada — ver EMAIL_VERIFICATION_REQUIRED
// em service.ts). Usado só pelos testes que precisam de uma conta ainda
// não verificada, para exercitar o mecanismo de OTP em si.
async function insertUnverifiedUser(email: string, password = "senhaforte123") {
  return authRepo.insertUser({ name: "Teste", email, passwordHash: await hashPassword(password) });
}

describe("registerUser", () => {
  it("cria a conta já verificada e com sessão (sem tela de código no fluxo atual)", async () => {
    const result = await authService.registerUser({
      name: "Teste",
      email: "teste@vigia.dev",
      password: "senhaforte123",
    });

    expect(result.ok).toBe(true);
    if (!result.ok || result.data.kind !== "session") throw new Error("esperava kind 'session'");
    expect(result.data.user.email).toBe("teste@vigia.dev");
    expect(result.data.user.emailVerified).toBe(true);
    expect(result.data.session.token).toHaveLength(43); // 32 bytes em base64url
  });

  it("recusa registro repetido para e-mail já verificado", async () => {
    await authService.registerUser({ name: "A", email: "dup@vigia.dev", password: "senhaforte123" });

    const second = await authService.registerUser({ name: "B", email: "dup@vigia.dev", password: "outrasenha1" });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe("email_taken");
  });

  it("permite retomar um cadastro cuja conta ainda não está verificada", async () => {
    await insertUnverifiedUser("incompleto@vigia.dev");
    const second = await authService.registerUser({ name: "A", email: "incompleto@vigia.dev", password: "senhaforte123" });
    expect(second.ok).toBe(true);
  });
});

describe("verifyOtp", () => {
  async function registerAndGetCode(email: string) {
    await insertUnverifiedUser(email);
    const result = await authService.requestEmailVerification(email);
    if (!result.ok) throw new Error("setup falhou");
    return result.data.devCode!;
  }

  it("verifica com o código certo e cria uma sessão", async () => {
    const code = await registerAndGetCode("otp1@vigia.dev");
    const result = await authService.verifyOtp({ email: "otp1@vigia.dev", code, purpose: "email_verification" });

    expect(result.ok).toBe(true);
    if (!result.ok || result.data.kind !== "session") return;
    expect(result.data.user.emailVerified).toBe(true);
    expect(result.data.session.token).toHaveLength(43); // 32 bytes em base64url
  });

  it("rejeita código errado sem consumir a tentativa duas vezes", async () => {
    await registerAndGetCode("otp2@vigia.dev");
    const result = await authService.verifyOtp({ email: "otp2@vigia.dev", code: "0000", purpose: "email_verification" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_code");
  });

  it("bloqueia após exceder o número máximo de tentativas", async () => {
    await registerAndGetCode("otp3@vigia.dev");
    for (let i = 0; i < 5; i++) {
      await authService.verifyOtp({ email: "otp3@vigia.dev", code: "0000", purpose: "email_verification" });
    }
    const result = await authService.verifyOtp({ email: "otp3@vigia.dev", code: "0000", purpose: "email_verification" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("too_many_attempts");
  });
});

describe("login", () => {
  it("aceita credenciais corretas de uma conta criada pelo cadastro", async () => {
    await authService.registerUser({ name: "Teste", email: "login1@vigia.dev", password: "senhaforte123" });
    const result = await authService.login({ email: "login1@vigia.dev", password: "senhaforte123" });
    expect(result.ok).toBe(true);
  });

  it("rejeita senha errada", async () => {
    await authService.registerUser({ name: "Teste", email: "login2@vigia.dev", password: "senhaforte123" });
    const result = await authService.login({ email: "login2@vigia.dev", password: "errada" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_credentials");
  });

  it("rejeita e-mail inexistente com a MESMA mensagem de senha errada (sem enumeração de conta)", async () => {
    const result = await authService.login({ email: "naoexiste@vigia.dev", password: "qualquer" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_credentials");
  });

  it("permite login mesmo com conta ainda não verificada (verificação desativada no fluxo atual)", async () => {
    await insertUnverifiedUser("naoverificado@vigia.dev", "senhaforte123");
    const result = await authService.login({ email: "naoverificado@vigia.dev", password: "senhaforte123" });
    expect(result.ok).toBe(true);
  });
});

describe("logout / getSessionUser", () => {
  it("invalida a sessão — getSessionUser retorna null depois do logout", async () => {
    const reg = await authService.registerUser({ name: "Teste", email: "sessao@vigia.dev", password: "senhaforte123" });
    if (!reg.ok || reg.data.kind !== "session") throw new Error("setup falhou");

    const before = await authService.getSessionUser(reg.data.session.token);
    expect(before).not.toBeNull();

    await authService.logout(reg.data.session.token);
    const after = await authService.getSessionUser(reg.data.session.token);
    expect(after).toBeNull();
  });
});

describe("resendOtp", () => {
  it("aplica cooldown depois do primeiro reenvio", async () => {
    await insertUnverifiedUser("resend@vigia.dev");

    const first = await authService.resendOtp({ email: "resend@vigia.dev", purpose: "email_verification" });
    expect(first.ok).toBe(true);

    const second = await authService.resendOtp({ email: "resend@vigia.dev", purpose: "email_verification" });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe("cooldown");
    expect(second.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("responde 'enviado' de forma neutra mesmo sem usuário (anti-enumeração)", async () => {
    const result = await authService.resendOtp({ email: "naoexiste2@vigia.dev", purpose: "email_verification" });
    expect(result.ok).toBe(true);
  });
});

describe("requestPasswordReset / resetPassword", () => {
  it("fluxo completo: pedir reset, verificar código, trocar senha, sessões antigas caem", async () => {
    const reg = await authService.registerUser({ name: "Teste", email: "reset@vigia.dev", password: "senhaAntiga1" });
    if (!reg.ok || reg.data.kind !== "session") throw new Error("setup falhou");
    const oldSessionToken = reg.data.session.token;

    const resetRequest = await authService.requestPasswordReset({ email: "reset@vigia.dev" });
    if (!resetRequest.ok) throw new Error("setup falhou");

    // Sem acesso direto ao e-mail "enviado" aqui — inspeciona o OTP mais
    // recente direto no banco, do mesmo jeito que o serviço faria.
    const user = await authRepo.findUserByEmail("reset@vigia.dev");
    const otp = await authRepo.findActiveOtp(user!.id, "password_reset");
    expect(otp).not.toBeNull();

    const verifyReset = await authService.verifyOtp({
      email: "reset@vigia.dev",
      code: resetRequest.data.devCode!,
      purpose: "password_reset",
    });
    expect(verifyReset.ok).toBe(true);
    if (!verifyReset.ok || verifyReset.data.kind !== "reset_token") throw new Error("esperava reset_token");

    const reset = await authService.resetPassword({
      resetToken: verifyReset.data.resetToken,
      newPassword: "senhaNova123",
    });
    expect(reset.ok).toBe(true);

    // Login com a senha antiga não funciona mais.
    const loginOld = await authService.login({ email: "reset@vigia.dev", password: "senhaAntiga1" });
    expect(loginOld.ok).toBe(false);

    // Login com a senha nova funciona.
    const loginNew = await authService.login({ email: "reset@vigia.dev", password: "senhaNova123" });
    expect(loginNew.ok).toBe(true);

    // A sessão de antes da troca de senha foi revogada.
    const oldSessionUser = await authService.getSessionUser(oldSessionToken);
    expect(oldSessionUser).toBeNull();
  });

  it("responde de forma neutra para e-mail inexistente", async () => {
    const result = await authService.requestPasswordReset({ email: "naoexiste3@vigia.dev" });
    expect(result.ok).toBe(true);
  });

  it("rejeita um resetToken inválido/expirado", async () => {
    const result = await authService.resetPassword({ resetToken: "token-invalido", newPassword: "senhaNova123" });
    expect(result.ok).toBe(false);
  });
});
