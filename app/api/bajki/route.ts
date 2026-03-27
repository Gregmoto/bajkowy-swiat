import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const bajki = await prisma.bajka.findMany({
      orderBy: { created: "desc" },
      take: 50,
      select: {
        id: true,
        tytul: true,
        tresc: true,
        imie: true,
        wiek: true,
        plec: true,
        motyw: true,
        ulubZwierze: true,
        ulubKolor: true,
        ulubZabawka: true,
        dodatkowe: true,
        moral: true,
        created: true,
        updated: true,
      },
    });

    return NextResponse.json(
      bajki.map((b) => ({
        ...b,
        created: b.created.toISOString(),
        updated: b.updated.toISOString(),
      }))
    );
  } catch (blad) {
    console.error("[GET /api/bajki] Błąd:", blad);
    return NextResponse.json(
      { error: "Nie udało się pobrać bajek." },
      { status: 500 }
    );
  }
}
