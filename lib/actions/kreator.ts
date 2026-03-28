"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  kreatorSchema,
  TEMAT_DO_THEME,
  type KreatorFormData,
} from "@/lib/validators/kreator";
import { generujBajkeLokalna } from "@/lib/generator/bajka";
import { mapDbError } from "@/lib/utils/db-error";

export type KreatorResult = { error: string } | null;

export async function utworzBajke(data: KreatorFormData): Promise<KreatorResult> {
  const session = await getSession();
  if (!session) return { error: "Nie jesteś zalogowany. Odśwież stronę i spróbuj ponownie." };

  const parsed = kreatorSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first.message };
  }

  const { childProfileId, temat, ton, dlugosc, moral, extra } = parsed.data;

  let profil: {
    userId: string; name: string; age: number; gender: "BOY" | "GIRL" | "OTHER";
    favoriteColor: string | null; favoriteAnimal: string | null; interests: string[];
  } | null;
  try {
    profil = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { userId: true, name: true, age: true, gender: true, favoriteColor: true, favoriteAnimal: true, interests: true },
    });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  if (!profil || profil.userId !== session.userId) {
    return { error: "Nie masz dostępu do tego profilu dziecka." };
  }

  // Generuj treść lokalnie
  let generated: { tytul: string; opis: string; tresc: string };
  try {
    generated = generujBajkeLokalna({
      temat,
      ton,
      dlugosc,
      name: profil.name,
      age: profil.age,
      gender: profil.gender,
      favoriteColor: profil.favoriteColor,
      favoriteAnimal: profil.favoriteAnimal,
      interests: profil.interests,
      moral: moral || null,
      dodatkowe: extra || null,
    });
  } catch {
    return { error: "Nie udało się wygenerować bajki. Spróbuj ponownie z innymi ustawieniami." };
  }

  const { tytul, opis, tresc } = generated;

  const theme = TEMAT_DO_THEME[temat] as
    | "ADVENTURE" | "MAGIC" | "FRIENDSHIP"
    | "ANIMALS"   | "SPACE" | "FAIRY_TALE" | "NATURE";

  const extraJson = JSON.stringify({ ton, dlugosc, tematWyswietlany: temat, dodatkowe: extra || null });

  let bajkaId: string;
  try {
    const bajka = await prisma.story.create({
      data: {
        userId:        session.userId,
        childProfileId,
        title:         tytul,
        summary:       opis,
        content:       tresc,
        theme,
        moral:         moral || null,
        extra:         extraJson,
        status:        "PUBLISHED",
        versions: {
          create: { version: 1, content: tresc, modelId: "local-generator-v1" },
        },
      },
    });
    bajkaId = bajka.id;
  } catch (err) {
    return { error: mapDbError(err) };
  }

  redirect(`/biblioteka/${bajkaId}`);
}
