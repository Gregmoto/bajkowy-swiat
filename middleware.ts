import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";

// Trasy wymagające zalogowania
const PROTECTED = [
  "/dashboard",
  "/dzieci",
  "/kreator",
  "/biblioteka",
  "/ustawienia",
];

// Trasy dostępne TYLKO dla niezalogowanych (przekieruj do /dashboard jeśli jest sesja)
const AUTH_ONLY = ["/login", "/register", "/forgot-password"];

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Brak zmiennej środowiskowej NEXTAUTH_SECRET");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Zweryfikuj token
  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, getSecret());
      isAuthenticated = true;
    } catch {
      // Token wygasł lub nieprawidłowy
      isAuthenticated = false;
    }
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  // Niezalogowany próbuje wejść na chronioną stronę
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Zalogowany wchodzi na stronę logowania/rejestracji
  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Wygasły token — wyczyść cookie i przekieruj do logowania
  if (isProtected && token && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
