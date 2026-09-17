/**
 * Sessão mock — FASE 1.
 *
 * Não existe autenticação real (sem backend, sem token, sem hashing).
 * Isto é só uma flag em localStorage para o app poder exigir que a
 * pessoa passe pela tela de login/cadastro antes de ver qualquer
 * página — o mesmo tipo de mock visual que o Vault e o OTP já usam.
 * A sessão real (JWT/cookie httpOnly/expiração) chega na FASE 2.
 */

const STORAGE_KEY = "vigia:session";

/** Rotas acessíveis sem sessão — o próprio fluxo de entrar/criar conta. */
export const PUBLIC_ROUTES = [
  "/login",
  "/cadastro",
  "/verificar-otp",
  "/recuperar-acesso",
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markAuthenticated(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Modo privado / storage bloqueado — a sessão mock simplesmente não
    // persiste entre recarregamentos; não é um erro fatal para a FASE 1.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // idem
  }
}

/**
 * Executado no <head>, antes da hidratação — mesmo padrão do
 * themeInitScript, para redirecionar sem flash de conteúdo protegido.
 * Roda de novo a cada navegação de documento completo (troca de aba,
 * link externo, refresh); navegações client-side do Next são cobertas
 * pelo AuthGate (componente React) abaixo.
 */
export const authGateInitScript = `
(function () {
  try {
    var path = window.location.pathname;
    var publicRoutes = ${JSON.stringify(PUBLIC_ROUTES)};
    var isPublic = publicRoutes.some(function (route) {
      return path === route || path.indexOf(route + '/') === 0;
    });
    if (isPublic) return;
    var session = localStorage.getItem('${STORAGE_KEY}');
    if (session !== 'true') {
      window.location.replace('/login');
    }
  } catch (e) {
    // Storage indisponível — não bloqueia a navegação nesse caso raro.
  }
})();
`;
