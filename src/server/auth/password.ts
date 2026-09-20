import argon2 from "argon2";

/**
 * argon2id é a recomendação atual da OWASP Password Storage Cheat
 * Sheet para hashing de senha (resistente a GPU e a ataques de
 * side-channel ao mesmo tempo). Parâmetros abaixo seguem a faixa
 * mínima recomendada pela OWASP para argon2id em servidores web
 * (m=19MiB, t=2, p=1) — ajustável depois com base em latência real
 * medida em produção, não adivinhação.
 */
const ARGON2_OPTIONS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // Hash corrompido/formato inesperado — trata como senha incorreta,
    // nunca deixa uma exceção de verificação virar um 500 genérico
    // nem, pior, um "sucesso" por acidente.
    return false;
  }
}
