import { Metadata } from "next";
import { notFound } from "next/navigation";
import BajkaTresc from "@/components/biblioteka/BajkaTresc";
import { prisma } from "@/lib/db";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bajka = await prisma.bajka.findUnique({
    where: { id: params.id },
    select: { tytul: true },
  });
  return { title: bajka ? `${bajka.tytul} — Bajkowy Świat` : "Bajka" };
}

// Strona czytania bajki — pełna treść z formatowaniem
export default async function CzytajBajkePage({ params }: Props) {
  const bajka = await prisma.bajka.findUnique({ where: { id: params.id } });
  if (!bajka) notFound();

  return <BajkaTresc bajka={bajka} />;
}
