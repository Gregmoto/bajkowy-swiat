import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import BajkaTresc from "@/components/biblioteka/BajkaTresc";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await prisma.story.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: story ? `${story.title} — Bajkowy Świat` : "Bajka" };
}

export default async function CzytajBajkePage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const story = await prisma.story.findUnique({
    where: { id: params.id },
    include: { childProfile: true },
  });

  if (!story || story.userId !== session.userId) notFound();

  return <BajkaTresc story={story} />;
}
