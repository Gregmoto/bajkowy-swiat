import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Edit2, Wand2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dziecko = await prisma.childProfile.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: `${dziecko?.name ?? "Profil"} — Bajkowy Świat` };
}

const PLEC_LABEL: Record<string, string> = {
  BOY: "chłopiec",
  GIRL: "dziewczynka",
  OTHER: "inne",
};

const AVATAR_FALLBACK: Record<string, string> = {
  BOY: "👦",
  GIRL: "👧",
  OTHER: "🧒",
};

export default async function ProfilDzieckaPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const dziecko = await prisma.childProfile.findUnique({
    where: { id: params.id },
    include: {
      stories: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, theme: true, coverImage: true, createdAt: true },
      },
      _count: { select: { stories: true } },
    },
  });

  if (!dziecko || dziecko.userId !== session.userId) {
    notFound();
  }

  const avatar = dziecko.avatar || AVATAR_FALLBACK[dziecko.gender] || "🧒";

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Nagłówek profilu */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-4xl shrink-0">
            {avatar}
          </div>
          <div>
            <h1 className="text-2xl font-black">{dziecko.name}</h1>
            <p className="text-muted-foreground">
              {dziecko.age} lat • {PLEC_LABEL[dziecko.gender] ?? dziecko.gender}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dzieci/${dziecko.id}/edytuj`}>
              <Edit2 className="mr-1.5 h-3.5 w-3.5" />
              Edytuj
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/kreator?dziecko=${dziecko.id}`}>
              <Wand2 className="mr-1.5 h-3.5 w-3.5" />
              Nowa bajka
            </Link>
          </Button>
        </div>
      </div>

      {/* Szczegóły */}
      <div className="grid gap-4 sm:grid-cols-2">
        {dziecko.favoriteColor && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ulubiony kolor
            </p>
            <p className="font-medium text-slate-700">{dziecko.favoriteColor}</p>
          </div>
        )}
        {dziecko.favoriteAnimal && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ulubione zwierzę
            </p>
            <p className="font-medium text-slate-700">{dziecko.favoriteAnimal}</p>
          </div>
        )}
      </div>

      {/* Zainteresowania */}
      {dziecko.interests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Zainteresowania
          </h2>
          <div className="flex flex-wrap gap-2">
            {dziecko.interests.map((z) => (
              <Badge key={z} variant="secondary" className="rounded-full text-sm px-3 py-1">
                {z}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notatki */}
      {dziecko.notes && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Dodatkowe informacje
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 rounded-xl p-4">
            {dziecko.notes}
          </p>
        </div>
      )}

      {/* Historia bajek */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">
            Bajki{" "}
            <span className="text-base font-normal text-muted-foreground">
              ({dziecko._count.stories})
            </span>
          </h2>
          {dziecko._count.stories > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/biblioteka?dziecko=${dziecko.id}`}>
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                Wszystkie
              </Link>
            </Button>
          )}
        </div>

        {dziecko.stories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 py-12 text-center">
            <span className="text-4xl">📖</span>
            <p className="text-sm text-muted-foreground">
              Brak bajek — stwórz pierwszą!
            </p>
            <Button size="sm" asChild>
              <Link href={`/kreator?dziecko=${dziecko.id}`}>Kreator bajki</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {dziecko.stories.map((bajka) => (
              <li key={bajka.id}>
                <Link
                  href={`/biblioteka/${bajka.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl shrink-0">{bajka.coverImage || "📖"}</span>
                  <span className="text-sm font-medium text-slate-800 truncate flex-1">
                    {bajka.title}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Intl.DateTimeFormat("pl-PL", {
                      day: "numeric",
                      month: "short",
                    }).format(new Date(bajka.createdAt))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
