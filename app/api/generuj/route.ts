import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generujBajke } from "@/lib/generuj-bajke";
import { bajkaSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth/session";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Wymagane logowanie." }, { status: 401 });
    }

    const body = await request.json();
    const validated = bajkaSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane formularza", szczegoly: validated.error.errors },
        { status: 400 }
      );
    }

    const dane = validated.data;
    const { tytul, tresc } = await generujBajke(dane);

    // Znajdź lub utwórz profil dziecka dla tego użytkownika
    let profile = await prisma.childProfile.findFirst({
      where: { userId: session.userId, name: dane.imie },
    });

    if (!profile) {
      profile = await prisma.childProfile.create({
        data: {
          userId: session.userId,
          name: dane.imie,
          age: dane.wiek,
          gender: dane.plec === "chlopiec" ? "BOY" : "GIRL",
          interests: [],
          favoriteAnimal: dane.ulubZwierze ?? null,
          favoriteColor: dane.ulubKolor ?? null,
        },
      });
    }

    const themeMap: Record<string, string> = {
      przygoda: "ADVENTURE", magia: "MAGIC", przyjazn: "FRIENDSHIP",
      zwierzeta: "ANIMALS", kosmos: "SPACE",
    };

    const story = await prisma.story.create({
      data: {
        userId: session.userId,
        childProfileId: profile.id,
        title: tytul,
        content: tresc,
        theme: (themeMap[dane.motyw] ?? "MAGIC") as never,
        moral: dane.moral ?? null,
        extra: dane.dodatkowe ?? null,
        status: "PUBLISHED",
        versions: {
          create: { version: 1, content: tresc, modelId: "claude-opus-4-6" },
        },
      },
    });

    return NextResponse.json({ id: story.id, tytul: story.title }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/generuj]", err);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas generowania bajki. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
