"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const edytujBajkeSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany").max(200).trim(),
  summary: z.string().max(500).trim().optional().or(z.literal("")),
  content: z.string().max(20000).trim().optional().or(z.literal("")),
  moral: z.string().max(300).trim().optional().or(z.literal("")),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]),
});

export type EdytujBajkeInput = z.infer<typeof edytujBajkeSchema>;

export async function zaktualizujBajke(
  id: string,
  data: EdytujBajkeInput
): Promise<BajkaActionResult> {
  const session = await getSession();
  if (!session) return { error: "Nie jesteś zalogowany." };

  const bajka = await prisma.story.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!bajka || bajka.userId !== session.userId) {
    return { error: "Nie masz dostępu do tej bajki." };
  }

  const parsed = edytujBajkeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { title, summary, content, moral, status } = parsed.data;

  await prisma.story.update({
    where: { id },
    data: {
      title,
      summary: summary || null,
      content: content || null,
      moral: moral || null,
      status,
    },
  });

  revalidatePath("/biblioteka");
  revalidatePath(`/biblioteka/${id}`);
  redirect(`/biblioteka/${id}`);
}

export type BajkaActionResult = { error: string } | null;

export async function usunBajke(id: string): Promise<BajkaActionResult> {
  const session = await getSession();
  if (!session) return { error: "Nie jesteś zalogowany." };

  const bajka = await prisma.story.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!bajka || bajka.userId !== session.userId) {
    return { error: "Nie masz dostępu do tej bajki." };
  }

  await prisma.story.delete({ where: { id } });
  revalidatePath("/biblioteka");

  return null;
}

export async function zmienStatusBajki(
  id: string,
  status: "PUBLISHED" | "ARCHIVED"
): Promise<BajkaActionResult> {
  const session = await getSession();
  if (!session) return { error: "Nie jesteś zalogowany." };

  const bajka = await prisma.story.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!bajka || bajka.userId !== session.userId) {
    return { error: "Nie masz dostępu do tej bajki." };
  }

  await prisma.story.update({ where: { id }, data: { status } });
  revalidatePath("/biblioteka");
  revalidatePath(`/biblioteka/${id}`);

  return null;
}
