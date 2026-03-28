import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import EdytujBajkeForm from "@/components/biblioteka/EdytujBajkeForm";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await prisma.story.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: story ? `Edytuj: ${story.title} — Bajkowy Świat` : "Edytuj bajkę" };
}

export default async function EdytujBajkePage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const story = await prisma.story.findUnique({ where: { id: params.id } });
  if (!story || story.userId !== session.userId) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Nawigacja */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/biblioteka/${story.id}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Wróć do bajki
          </Link>
        </Button>
      </div>

      {/* Nagłówek */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
          <Pencil className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Edytuj bajkę</h1>
          <p className="text-sm text-muted-foreground">Zmiany zostaną zapisane natychmiast.</p>
        </div>
      </div>

      {/* Formularz */}
      <EdytujBajkeForm story={story} />
    </div>
  );
}
