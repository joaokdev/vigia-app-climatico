"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./split-panel-auth.css";
import { markAuthenticated } from "@/lib/auth/session";
import { PasswordStrengthVault } from "@/components/effects/password-strength/PasswordStrengthVault";

/**
 * Efeito de terceiro "Split Panel Auth" (login-signup-animation) — porte
 * fiel do pacote original para React/Next. A troca de painel (overlay com
 * gradiente + light-sweep) preserva exatamente o mecanismo e o timing do
 * script original (guarda de animação em andamento, reflow forçado antes
 * de reiniciar o sweep, SWITCH_DURATION = 900ms). Apenas cor (para seguir
 * o tema do app), texto (PT-BR) e a ação pós-submit (que no pacote
 * original é só uma demonstração) foram adaptados — a última é
 * exatamente o ponto de customização que o próprio autor do efeito
 * documenta ("replace handleFormSubmit with your own auth logic").
 *
 * O campo de senha do cadastro reaproveita o Vault (mesmo efeito já usado
 * na tela de cadastro anterior) em vez do par senha/confirmar senha do
 * pacote original, para manter paridade com o que a FASE 1 já tinha.
 */

const SWITCH_DURATION = 900; // mesmo valor de --dur-switch no CSS
const SUCCESS_REVERT_MS = 2200; // mesmo valor do pacote original

type PanelMode = "login" | "register";
type SubmitState = "idle" | "success";

export function SplitPanelAuth({
  initialMode = "login",
}: {
  initialMode?: PanelMode;
}) {
  const [mode, setMode] = useState<PanelMode>(initialMode);
  const [loginState, setLoginState] = useState<SubmitState>("idle");
  const [registerState, setRegisterState] = useState<SubmitState>("idle");
  const isAnimatingRef = useRef(false);
  const sweepRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const triggerSweep = useCallback(() => {
    const el = sweepRef.current;
    if (!el) return;
    el.classList.remove("is-active");
    // Força reflow antes de reativar — mesmo truque do script.js original
    // (senão o navegador agrupa a remoção+adição da classe e a animação
    // não reinicia).
    void el.offsetWidth;
    el.classList.add("is-active");
  }, []);

  const switchTo = useCallback(
    (next: PanelMode) => {
      if (isAnimatingRef.current || next === mode) return;
      isAnimatingRef.current = true;
      triggerSweep();
      setMode(next);
      window.setTimeout(() => {
        isAnimatingRef.current = false;
      }, SWITCH_DURATION);
    },
    [mode, triggerSweep]
  );

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loginState === "success") return;
    setLoginState("success");
    window.setTimeout(() => setLoginState("idle"), SUCCESS_REVERT_MS);
    // FASE 1: sem verificação real de credenciais. Marca a sessão mock e
    // libera o app — a verificação real chega na FASE 2.
    window.setTimeout(() => {
      markAuthenticated();
      router.push("/");
    }, 900); // mesmo delay que a tela de login anterior já usava
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (registerState === "success") return;
    setRegisterState("success");
    window.setTimeout(() => setRegisterState("idle"), SUCCESS_REVERT_MS);
    // FASE 1: simula o passo "envio de OTP" e segue para a verificação,
    // igual ao cadastro anterior — a sessão só é marcada lá, após o
    // código ser confirmado.
    window.setTimeout(() => {
      router.push("/verificar-otp?origem=cadastro");
    }, 700); // mesmo delay que a tela de cadastro anterior já usava
  }

  return (
    <div className={`split-auth-root${mode === "register" ? " is-register" : ""}`}>
      <main
        className={`auth-container${mode === "register" ? " active" : ""}`}
      >
        <div className="light-sweep" ref={sweepRef} aria-hidden="true" />

        {/* Login (painel esquerdo) */}
        <section
          className="form-panel form-panel--login"
          aria-label="Entrar"
          inert={mode === "register"}
        >
          <form className="auth-form" noValidate onSubmit={handleLoginSubmit}>
            <header className="form-header">
              <p className="form-eyebrow">Bem-vindo de volta</p>
              <h1 className="form-title">Entrar</h1>
              <p className="form-sub">
                Acompanhe o clima e os rios da sua região.
              </p>
            </header>

            <div className="field field--stagger" style={{ ["--i" as string]: 0 }}>
              <label className="field-label" htmlFor="loginEmail">
                E-mail
              </label>
              <div className="field-wrap">
                <MailIcon className="field-icon" />
                <input
                  type="email"
                  id="loginEmail"
                  name="email"
                  className="field-input"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field field--stagger" style={{ ["--i" as string]: 1 }}>
              <label className="field-label" htmlFor="loginPassword">
                Senha
              </label>
              <div className="field-wrap">
                <LockIcon className="field-icon" />
                <input
                  type="password"
                  id="loginPassword"
                  name="password"
                  className="field-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="form-row field--stagger" style={{ ["--i" as string]: 2 }}>
              <label className="checkbox-label">
                <input type="checkbox" name="remember" />
                <span className="checkbox-box" aria-hidden="true" />
                <span>Lembrar de mim</span>
              </label>
              <a
                href="/recuperar-acesso"
                className="form-link"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/recuperar-acesso");
                }}
              >
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              className={`btn btn--primary field--stagger${loginState === "success" ? " is-success" : ""}`}
              style={{ ["--i" as string]: 3 }}
            >
              <span className="btn-text">Entrar</span>
              <span className="btn-success" aria-hidden="true">
                <CheckIcon />
              </span>
            </button>

            <div className="social-divider field--stagger" style={{ ["--i" as string]: 4 }}>
              <span>ou continue com</span>
            </div>

            <div className="social-row field--stagger" style={{ ["--i" as string]: 5 }}>
              <button
                type="button"
                className="btn btn--social"
                aria-label="Entrar com Google"
                onClick={(e) => e.preventDefault()}
              >
                <GoogleIcon />
              </button>
              <button
                type="button"
                className="btn btn--social"
                aria-label="Entrar com GitHub"
                onClick={(e) => e.preventDefault()}
              >
                <GithubIcon />
              </button>
            </div>
            <p className="split-auth-note">
              Implementado visualmente como mock para a FASE 1 — nenhuma
              autenticação real é realizada.
            </p>
          </form>
        </section>

        {/* Cadastro (painel direito) */}
        <section
          className="form-panel form-panel--register"
          aria-label="Criar conta"
          inert={mode === "login"}
        >
          <form className="auth-form" noValidate onSubmit={handleRegisterSubmit}>
            <header className="form-header">
              <p className="form-eyebrow">Criar conta</p>
              <h1 className="form-title">Criar conta no VIGIA</h1>
              <p className="form-sub">
                Receba um código de verificação por e-mail para continuar.
              </p>
            </header>

            <div className="field field--stagger" style={{ ["--i" as string]: 0 }}>
              <label className="field-label" htmlFor="registerName">
                Nome
              </label>
              <div className="field-wrap">
                <UserIcon className="field-icon" />
                <input
                  type="text"
                  id="registerName"
                  name="name"
                  className="field-input"
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="field field--stagger" style={{ ["--i" as string]: 1 }}>
              <label className="field-label" htmlFor="registerEmail">
                E-mail
              </label>
              <div className="field-wrap">
                <MailIcon className="field-icon" />
                <input
                  type="email"
                  id="registerEmail"
                  name="email"
                  className="field-input"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field field--stagger split-auth-vault-field" style={{ ["--i" as string]: 2 }}>
              <div className="split-auth-vault-wrap">
                <PasswordStrengthVault />
              </div>
            </div>

            <div className="form-row field--stagger" style={{ ["--i" as string]: 3 }}>
              <label className="checkbox-label">
                <input type="checkbox" name="terms" required />
                <span className="checkbox-box" aria-hidden="true" />
                <span>
                  Concordo com os{" "}
                  <a
                    href="/sobre"
                    className="form-link form-link--inline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Termos
                  </a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className={`btn btn--primary field--stagger${registerState === "success" ? " is-success" : ""}`}
              style={{ ["--i" as string]: 4 }}
            >
              <span className="btn-text">Criar conta</span>
              <span className="btn-success" aria-hidden="true">
                <CheckIcon />
              </span>
            </button>
            <p className="split-auth-note">
              Implementado visualmente como mock para a FASE 1 — cadastro
              real, hashing de senha e criação de conta chegam na FASE 2.
            </p>
          </form>
        </section>

        {/* Faixa com gradiente — alterna qual painel fica visível */}
        <aside className="overlay-panel" aria-label="Alternar entre entrar e criar conta">
          <div className="overlay-decor" aria-hidden="true">
            <div className="decor-orb decor-orb--1" />
            <div className="decor-orb decor-orb--2" />
            <div className="decor-orb decor-orb--3" />
            <div className="decor-orbit">
              <span className="decor-dot decor-dot--1" />
              <span className="decor-dot decor-dot--2" />
              <span className="decor-dot decor-dot--3" />
            </div>
            <div className="decor-streak decor-streak--1" />
            <div className="decor-streak decor-streak--2" />
            <div className="decor-grain" />
          </div>

          <div className="overlay-content overlay-content--signup">
            <h2 className="overlay-title">Novo por aqui?</h2>
            <p className="overlay-sub">
              Crie uma conta e acompanhe clima, chuva e rios da sua região.
            </p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => switchTo("register")}
            >
              Criar conta
            </button>
          </div>

          <div className="overlay-content overlay-content--signin">
            <h2 className="overlay-title">Já tem conta?</h2>
            <p className="overlay-sub">
              Entre de novo e continue de onde parou.
            </p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => switchTo("login")}
            >
              Entrar
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* Ícones — mesmos traçados simples do pacote original (svg inline, sem
   dependência externa). */

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6h16v12H4V6zm0 0l8 7 8-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline
        points="5,13 10,18 19,7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 11v2.4h3.7c-.2 1.6-1.8 4.6-5.1 4.6-3.1 0-5.6-2.5-5.6-5.6S7.5 6.8 10.6 6.8c1.8 0 3 .8 3.7 1.4l2.5-2.4C15.2 4.6 13.1 3.6 10.6 3.6 5.9 3.6 2 7.5 2 12.2s3.9 8.6 8.6 8.6c5 0 8.3-3.5 8.3-8.5 0-.6-.1-1-.1-1.2H12z"
        fill="currentColor"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.11-1.48-1.11-1.48-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.75 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"
        fill="currentColor"
      />
    </svg>
  );
}
