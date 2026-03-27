import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import BajkaTresc from "@/components/biblioteka/BajkaTresc";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await prisma.story.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: story ? `${story.title} — Bajkowy Świat` : "Bajka" };
}

export default async function CzytajBajkePage({ params }: Props) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    include: { childProfile: true },
  });
  if (!story) notFound();

  return <BajkaTresc story={story} />;
}
