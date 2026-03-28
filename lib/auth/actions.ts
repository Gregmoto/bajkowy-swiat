"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/auth/validations";
import { mapDbError } from "@/lib/utils/db-error";

export type AuthState = { error: string; field?: string } | null;

// ---------------------------------------------------------------------------
// LOGOWANIE
// ---------------------------------------------------------------------------
export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first.message, field: first.path[0] as string };
  }

  let user: { id: string; email: string; name: string; role: "USER" | "ADMIN"; passwordHash: string | null; isBanned: boolean } | null;
  try {
    user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  if (!user || !user.passwordHash) {
    return { error: "Nieprawidłowy email lub hasło" };
  }

  if (user.isBanned) {
    return { error: "Twoje konto zostało zablokowane. Skontaktuj się z obsługą: pomoc@bajkowyswiat.pl" };
  }

  let passwordOk: boolean;
  try {
    passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
  } catch {
    return { error: "Błąd weryfikacji hasła. Spróbuj ponownie." };
  }

  if (!passwordOk) {
    return { error: "Nieprawidłowy email lub hasło" };
  }

  try {
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch {
    return { error: "Nie udało się zalogować. Spróbuj ponownie." };
  }

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// REJESTRACJA
// ---------------------------------------------------------------------------
export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first.message, field: first.path[0] as string };
  }

  // Sprawdź duplikat email
  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) {
      return { error: "Konto z tym adresem email już istnieje", field: "email" };
    }
  } catch (err) {
    return { error: mapDbError(err) };
  }

  // Utwórz użytkownika
  let user: { id: string; email: string; name: string; role: "USER" | "ADMIN" };
  try {
    const passwordHash = await hashPassword(parsed.data.password);
    user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name.trim(),
        passwordHash,
        subscription: {
          create: { plan: "FREE" },
        },
      },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  // Utwórz sesję — jeśli się nie uda, konto istnieje, ale użytkownik może się zalogować ręcznie
  try {
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch {
    return {
      error:
        "Konto zostało utworzone, ale nie udało się zalogować automatycznie. Zaloguj się ręcznie.",
    };
  }

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// WYLOGOWANIE
// ---------------------------------------------------------------------------
export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}
