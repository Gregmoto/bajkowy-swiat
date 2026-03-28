import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";

// Trasy wymagające zalogowania (dowolna rola)
const PROTECTED = [
  "/dashboard",
  "/dzieci",
  "/kreator",
  "/biblioteka",
  "/ustawienia",
];

// Trasy wymagające roli ADMIN
const ADMIN_ONLY = ["/admin"];

// Trasy dostępne TYLKO dla niezalogowanych
const AUTH_ONLY = ["/login", "/register", "/forgot-password"];

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Brak zmiennej środowiskowej NEXTAUTH_SECRET");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Zweryfikuj token i wyciągnij payload
  type SessionClaims = { role?: string; userId?: string };
  let payload: SessionClaims | null = null;
  if (token) {
    try {
      const result = await jwtVerify(token, getSecret());
      payload = result.payload as unknown as SessionClaims;
    } catch {
      payload = null;
    }
  }

  const isAuthenticated = payload !== null;
  const isAdmin = payload?.role === "ADMIN";

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAdminOnly = ADMIN_ONLY.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  // ── Trasy admina ─────────────────────────────────────────────────────────
  if (isAdminOnly) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Zalogowany USER próbuje wejść do panelu admin → do dashboardu
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ── Chronione trasy użytkownika ───────────────────────────────────────────
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    // Wygasły token — wyczyść cookie
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // ── Niezalogowany widzi tylko auth strony ─────────────────────────────────
  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/dzieci/:path*",
    "/kreator/:path*",
    "/biblioteka/:path*",
    "/ustawienia/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
