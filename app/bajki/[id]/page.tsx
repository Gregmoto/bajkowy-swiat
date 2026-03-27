import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  MOTYWY_LABELS,
  MOTYWY_EMOJI,
  MOTYWY_KOLORY,
  PLEC_LABELS,
} from "@/types";
import UsunBajkeButton from "./UsunBajkeButton";

interface Props {
  params: { id: string };
}

async function getBajka(id: string) {
  try {
    return await prisma.bajka.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bajka = await getBajka(params.id);
  if (!bajka) return { title: "Bajka nie znaleziona" };
  return {
    title: `${bajka.tytul} — Bajkowy Świat`,
    description: bajka.tresc.slice(0, 160),
  };
}

export default async function StronaBajki({ params }: Props) {
  const bajka = await getBajka(params.id);
  if (!bajka) notFound();

  const motywEmoji = MOTYWY_EMOJI[bajka.motyw] ?? "📖";
  const motywLabel = MOTYWY_LABELS[bajka.motyw] ?? bajka.motyw;
  const motywKolor =
    MOTYWY_KOLORY[bajka.motyw] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const plecLabel = PLEC_LABELS[bajka.plec] ?? bajka.plec;

  // Podziel treść na akapity
  const akapity = bajka.tresc
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Nawigacja wstecz */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/" className="flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Wszystkie bajki
        </Link>
      </Button>

      {/* Nagłówek bajki */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${motywKolor}`}
          >
            <span>{motywEmoji}</span>
            {motywLabel}
          </span>
          {bajka.moral && (
            <Badge variant="outline" className="text-xs">
              Z morałem
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          {bajka.tytul}
        </h1>

        {/* Meta informacje */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {bajka.imie}, {bajka.wiek} lat ({plecLabel})
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(bajka.created)}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {akapity.length} akapitów
          </span>
        </div>
      </div>

      <Separator />

      {/* Treść bajki */}
      <article className="space-y-5 text-base leading-relaxed sm:text-lg">
        {akapity.map((akapit, i) => (
          <p key={i} className="text-foreground/90">
            {akapit}
          </p>
        ))}
      </article>

      {/* Tagi preferencji */}
      {(bajka.ulubZwierze || bajka.ulubKolor || bajka.ulubZabawka) && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Elementy bajki
            </p>
            <div className="flex flex-wrap gap-2">
              {bajka.ulubZwierze && (
                <Badge variant="secondary">🐾 {bajka.ulubZwierze}</Badge>
              )}
              {bajka.ulubKolor && (
                <Badge variant="secondary">🎨 {bajka.ulubKolor}</Badge>
              )}
              {bajka.ulubZabawka && (
                <Badge variant="secondary">🧸 {bajka.ulubZabawka}</Badge>
              )}
            </div>
          </div>
        </>
      )}

      {/* Morał */}
      {bajka.moral && (
        <div className="rounded-xl border bg-primary/5 p-5 space-y-1">
          <p className="text-sm font-semibold text-primary">Morał bajki</p>
          <p className="text-sm text-muted-foreground italic">
            &ldquo;{bajka.moral}&rdquo;
          </p>
        </div>
      )}

      <Separator />

      {/* Akcje */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/nowa-bajka">
            <Sparkles className="mr-2 h-4 w-4" />
            Stwórz nową bajkę
          </Link>
        </Button>
        <UsunBajkeButton bajkaId={bajka.id} />
      </div>
    </div>
  );
}
