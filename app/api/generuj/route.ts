import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generujBajke } from "@/lib/generuj-bajke";
import { bajkaSchema } from "@/lib/validations";

// Vercel: pozwól na dłuższe wykonanie (max 60s na hobby, 300s na pro)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Walidacja danych wejściowych
    const wynikWalidacji = bajkaSchema.safeParse(body);
    if (!wynikWalidacji.success) {
      return NextResponse.json(
        {
          error: "Nieprawidłowe dane formularza",
          szczegoly: wynikWalidacji.error.errors,
        },
        { status: 400 }
      );
    }

    const dane = wynikWalidacji.data;

    // Generuj bajkę przy użyciu Claude Opus 4.6
    const { tytul, tresc } = await generujBajke(dane);

    // Zapisz do bazy danych
    const bajka = await prisma.bajka.create({
      data: {
        tytul,
        tresc,
        imie: dane.imie,
        wiek: dane.wiek,
        plec: dane.plec,
        motyw: dane.motyw,
        ulubZwierze: dane.ulubZwierze ?? null,
        ulubKolor: dane.ulubKolor ?? null,
        ulubZabawka: dane.ulubZabawka ?? null,
        dodatkowe: dane.dodatkowe ?? null,
        moral: dane.moral ?? null,
      },
    });

    return NextResponse.json(
      { id: bajka.id, tytul: bajka.tytul },
      { status: 201 }
    );
  } catch (blad) {
    console.error("[POST /api/generuj] Błąd:", blad);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas generowania bajki. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
