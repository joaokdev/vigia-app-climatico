import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanDatabase } from "../__tests__/db-helpers";
import { pool } from "../db/client";
import { redis } from "../db/redis";
import * as authService from "../auth/service";

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

describe("registerUser", () => {
  it("cria um usuário não verificado e retorna um devCode em dev", async () => {
    const result = await authService.registerUser({
      name: "Teste",
      email: "teste@vigia.dev",
      password: "senhaforte123",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.email).toBe("teste@vigia.dev");
    expect(result.data.devCode).toMatch(/^\d{4}$/);
  });

  it("recusa registro repetido para e-mail já verificado", async () => {
    await authService.registerUser({ name: "A", email: "dup@vigia.dev", password: "senhaforte123" });
    const first = await authService.registerUser({ name: "A", email: "dup@vigia.dev", password: "senhaforte123" });
    if (!first.ok) throw new Error("setup falhou");
    await authService.verifyOtp({
      email: "dup@vigia.dev",
      code: first.data.devCode!,
      purpose: "email_verification",
    });

    const second = await authService.registerUser({ name: "B", email: "dup@vigia.dev", password: "outrasenha1" });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe("email_taken");
  });

  it("permite retomar um registro não verificado (reenvio de cadastro)", async () => {
    await authService.registerUser({ name: "A", email: "incompleto@vigia.dev", password: "senhaforte123" });
    const second = await authService.registerUser({ name: "A", email: "incompleto@vigia.dev", password: "senhaforte123" });
    expect(second.ok).toBe(true);
  });
});

describe("verifyOtp", () => {
  async function registerAndGetCode(email: string) {
    const result = await authService.registerUser({ name: "Teste", email, password: "senhaforte123" });
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
  async function registerAndVerify(email: string, password: string) {
    const reg = await authService.registerUser({ name: "Teste", email, password });
    if (!reg.ok) throw new Error("setup falhou");
    await authService.verifyOtp({ email, code: reg.data.devCode!, purpose: "email_verification" });
  }

  it("aceita credenciais corretas de uma conta verificada", async () => {
    await registerAndVerify("login1@vigia.dev", "senhaforte123");
    const result = await authService.login({ email: "login1@vigia.dev", password: "senhaforte123" });
    expect(result.ok).toBe(true);
  });

  it("rejeita senha errada", async () => {
    await registerAndVerify("login2@vigia.dev", "senhaforte123");
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

  it("rejeita login antes da verificação de e-mail", async () => {
    await authService.registerUser({ name: "Teste", email: "naoverificado@vigia.dev", password: "senhaforte123" });
    const result = await authService.login({ email: "naoverificado@vigia.dev", password: "senhaforte123" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("email_not_verified");
  });
});

describe("logout / getSessionUser", () => {
  it("invalida a sessão — getSessionUser retorna null depois do logout", async () => {
    const reg = await authService.registerUser({ name: "Teste", email: "sessao@vigia.dev", password: "senhaforte123" });
    if (!reg.ok) throw new Error("setup falhou");
    const verify = await authService.verifyOtp({ email: "sessao@vigia.dev", code: reg.data.devCode!, purpose: "email_verification" });
    if (!verify.ok || verify.data.kind !== "session") throw new Error("setup falhou");

    const before = await authService.getSessionUser(verify.data.session.token);
    expect(before).not.toBeNull();

    await authService.logout(verify.data.session.token);
    const after = await authService.getSessionUser(verify.data.session.token);
    expect(after).toBeNull();
  });
});

describe("resendOtp", () => {
  it("aplica cooldown depois do primeiro reenvio", async () => {
    await authService.registerUser({ name: "Teste", email: "resend@vigia.dev", password: "senhaforte123" });

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
    if (!reg.ok) throw new Error("setup falhou");
    const verify = await authService.verifyOtp({ email: "reset@vigia.dev", code: reg.data.devCode!, purpose: "email_verification" });
    if (!verify.ok || verify.data.kind !== "session") throw new Error("setup falhou");
    const oldSessionToken = verify.data.session.token;

    const resetRequest = await authService.requestPasswordReset({ email: "reset@vigia.dev" });
    if (!resetRequest.ok) throw new Error("setup falhou");

    // Sem acesso direto ao e-mail "enviado" aqui — inspeciona o OTP mais
    // recente direto no banco, do mesmo jeito que o serviço faria.
    const { findUserByEmail, findActiveOtp } = await import("../auth/repository");
    const user = await findUserByEmail("reset@vigia.dev");
    const otp = await findActiveOtp(user!.id, "password_reset");
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
