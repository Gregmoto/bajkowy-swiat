"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { profilDzieckaSchema, type ProfilDzieckaInput } from "@/lib/validators/dziecko";
import { mapDbError } from "@/lib/utils/db-error";

export type ActionResult = { error: string; field?: string } | null;

// ---------------------------------------------------------------------------
// Utwórz nowy profil dziecka
// ---------------------------------------------------------------------------
export async function utworzProfilDziecka(data: ProfilDzieckaInput): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Nie jesteś zalogowany. Odśwież stronę i spróbuj ponownie." };

  const parsed = profilDzieckaSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first.message, field: first.path[0] as string };
  }

  const { name, age, gender, interests, favoriteColor, favoriteAnimal, notes, avatar } = parsed.data;

  try {
    await prisma.childProfile.create({
      data: {
        userId: session.userId,
        name,
        age,
        gender,
        interests,
        favoriteColor: favoriteColor || null,
        favoriteAnimal: favoriteAnimal || null,
        notes: notes || null,
        avatar: avatar || null,
      },
    });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  redirect("/dzieci");
}

// ---------------------------------------------------------------------------
// Zaktualizuj istniejący profil dziecka
// ---------------------------------------------------------------------------
export async function zaktualizujProfilDziecka(
  id: string,
  data: ProfilDzieckaInput
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Nie jesteś zalogowany. Odśwież stronę i spróbuj ponownie." };

  let profil: { userId: string } | null;
  try {
    profil = await prisma.childProfile.findUnique({
      where: { id },
      select: { userId: true },
    });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  if (!profil || profil.userId !== session.userId) {
    return { error: "Nie masz dostępu do tego profilu." };
  }

  const parsed = profilDzieckaSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first.message, field: first.path[0] as string };
  }

  const { name, age, gender, interests, favoriteColor, favoriteAnimal, notes, avatar } = parsed.data;

  try {
    await prisma.childProfile.update({
      where: { id },
      data: {
        name,
        age,
        gender,
        interests,
        favoriteColor: favoriteColor || null,
        favoriteAnimal: favoriteAnimal || null,
        notes: notes || null,
        avatar: avatar || null,
      },
    });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  redirect(`/dzieci/${id}`);
}

// ---------------------------------------------------------------------------
// Usuń profil dziecka
// ---------------------------------------------------------------------------
export async function usunProfilDziecka(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Nie jesteś zalogowany." };

  let profil: { userId: string } | null;
  try {
    profil = await prisma.childProfile.findUnique({
      where: { id },
      select: { userId: true },
    });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  if (!profil || profil.userId !== session.userId) {
    return { error: "Nie masz dostępu do tego profilu." };
  }

  try {
    await prisma.childProfile.delete({ where: { id } });
  } catch (err) {
    return { error: mapDbError(err) };
  }

  redirect("/dzieci");
}
