import Link from "next/link";
import { PlusCircle, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import BajkaKarta from "@/components/BajkaKarta";
import { prisma } from "@/lib/db";
import { Bajka } from "@/types";

async function getBajki(): Promise<Bajka[]> {
  try {
    const bajki = await prisma.bajka.findMany({
      orderBy: { created: "desc" },
      take: 50,
    });
    return bajki.map((b) => ({
      ...b,
      created: b.created.toISOString(),
      updated: b.updated.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function StronaGlowna() {
  const bajki = await getBajki();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-10 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Bajki pisane przez AI
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Bajkowy Świat
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Twórz magiczne, spersonalizowane bajki, w których{" "}
          <strong>Twoje dziecko jest głównym bohaterem</strong>. Każda bajka
          jest wyjątkowa i dopasowana do preferencji Twojego malucha.
        </p>
        <Button size="lg" asChild className="mt-2">
          <Link href="/nowa-bajka" className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Stwórz nową bajkę
          </Link>
        </Button>
      </section>

      {/* Lista bajek */}
      <section>
        {bajki.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center space-y-4">
            <div className="text-6xl">📖</div>
            <h2 className="text-xl font-semibold">
              Brak bajek
            </h2>
            <p className="text-muted-foreground max-w-xs">
              Nie masz jeszcze żadnych bajek. Stwórz pierwszą i zacznij
              magiczną przygodę!
            </p>
            <Button asChild>
              <Link href="/nowa-bajka">
                <PlusCircle className="mr-2 h-4 w-4" />
                Stwórz pierwszą bajkę
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Twoje bajki
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  ({bajki.length})
                </span>
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/nowa-bajka">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nowa bajka
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bajki.map((bajka) => (
                <BajkaKarta key={bajka.id} bajka={bajka} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
