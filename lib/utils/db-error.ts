import { Prisma } from "@prisma/client";

/**
 * Maps Prisma errors to safe, user-readable Polish messages.
 * Never exposes raw DB details to the client.
 */
export function mapDbError(err: unknown): string {
  // Log full error server-side for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error("[DB Error]", err);
  } else {
    console.error("[DB Error]", err instanceof Error ? err.message : "unknown");
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // Unique constraint violation
      case "P2002": {
        const field = (err.meta?.target as string[] | undefined)?.[0];
        if (field === "email") return "Konto z tym adresem email już istnieje.";
        return "Ten rekord już istnieje w systemie.";
      }
      // Record not found
      case "P2025":
        return "Nie znaleziono szukanego rekordu.";
      // Foreign key constraint failed
      case "P2003":
        return "Błąd powiązania danych. Odśwież stronę i spróbuj ponownie.";
      // Transaction conflict
      case "P2034":
        return "Konflikt zapisu danych. Spróbuj ponownie za chwilę.";
      // Connection error
      case "P1001":
      case "P1002":
        return "Nie można połączyć się z bazą danych. Spróbuj za chwilę.";
      default:
        return "Błąd bazy danych. Spróbuj ponownie za chwilę.";
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return "Nieprawidłowe dane wejściowe. Sprawdź formularz i spróbuj ponownie.";
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return "Problem z połączeniem z bazą danych. Spróbuj ponownie za chwilę.";
  }

  return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
}
