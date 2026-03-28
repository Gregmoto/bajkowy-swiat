import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Wand2 } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import BajkaFilter from "@/components/biblioteka/BajkaFilter";
import BajkaKarta from "@/components/biblioteka/BajkaKarta";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Biblioteka bajek — Bajkowy Świat",
};

interface Props {
  searchParams: { sort?: string; temat?: string; status?: string };
}

function buildOrderBy(sort: string): Prisma.StoryOrderByWithRelationInput {
  switch (sort) {
    case "najstarsze": return { createdAt: "asc" };
    case "temat":      return { theme: "asc" };
    case "tytul":      return { title: "asc" };
    default:           return { createdAt: "desc" };
  }
}

export default async function BiblotekaPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sort   = searchParams.sort   ?? "najnowsze";
  const temat  = searchParams.temat  ?? "";
  const status = searchParams.status ?? "";

  const where: Prisma.StoryWhereInput = {
    userId: session.userId,
    ...(temat  ? { theme:  temat  as never } : {}),
    ...(status ? { status: status as never } : {}),
  };

  const bajki = await prisma.story.findMany({
    where,
    orderBy: buildOrderBy(sort),
    include: {
      childProfile: { select: { name: true, avatar: true, gender: true } },
    },
  });

  const liczbaBajek = bajki.length;

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <BookOpen className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Biblioteka bajek</h1>
            <p className="text-sm text-muted-foreground">
              {liczbaBajek === 0
                ? "Brak bajek — stwórz pierwszą!"
                : `${liczbaBajek} ${liczbaBajek === 1 ? "bajka" : liczbaBajek < 5 ? "bajki" : "bajek"}`}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/kreator">
            <Wand2 className="mr-2 h-4 w-4" />
            Nowa bajka
          </Link>
        </Button>
      </div>

      {/* Filtry */}
      <Suspense>
        <BajkaFilter />
      </Suspense>

      {/* Lista bajek */}
      {bajki.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 py-20 text-center">
          <span className="text-5xl">📖</span>
          <div>
            <p className="font-semibold text-slate-700">
              {temat || status ? "Brak bajek spełniających kryteria" : "Twoja biblioteka jest pusta"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {temat || status
                ? "Spróbuj zmienić filtry."
                : "Utwórz pierwszą bajkę w kreatorze."}
            </p>
          </div>
          {!temat && !status && (
            <Button asChild>
              <Link href="/kreator">
                <Wand2 className="mr-2 h-4 w-4" />
                Stwórz bajkę
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bajki.map((bajka) => (
            <BajkaKarta key={bajka.id} bajka={bajka} />
          ))}
        </div>
      )}
    </div>
  );
}
