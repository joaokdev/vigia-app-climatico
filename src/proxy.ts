import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/server/lib/env";

/**
 * Substitui o gate mock (script inline + AuthGate client-side lendo
 * localStorage) por verificação real, no servidor, antes de qualquer
 * HTML ser enviado — cobre carregamento completo de página E
 * navegação client-side do Next (proxy roda nas duas).
 *
 * Nomeado `proxy.ts` (não `middleware.ts`) seguindo a convenção do
 * Next.js 16 — mesma coisa, arquivo/export renomeados pelo framework.
 *
 * Só verifica a PRESENÇA do cookie de sessão aqui (rápido, sem tocar
 * o banco a cada navegação). A validade de verdade (sessão existe,
 * não expirou, usuário existe) é checada por quem realmente precisa
 * do usuário — GET /api/auth/me e as rotas de API que usam
 * getSessionUser(). Um cookie presente mas expirado/inválido passa
 * por aqui e é pego logo depois nessas chamadas; não é uma falha de
 * segurança, é uma cobertura em duas camadas com custos diferentes.
 */

const SESSION_COOKIE_NAME = env.SESSION_COOKIE_NAME;

const PUBLIC_ROUTES = ["/login", "/cadastro", "/verificar-otp", "/recuperar-acesso"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname)) return NextResponse.next();

  const hasSession = req.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Roda em toda navegação de página, mas nunca em assets estáticos,
  // imagens do Next ou nas próprias rotas de API (que fazem sua
  // própria checagem de sessão via readSessionCookie/getSessionUser).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand|effects).*)"],
};
