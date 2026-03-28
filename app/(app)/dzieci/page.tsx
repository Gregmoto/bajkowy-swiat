import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import DzieckoKarta from "@/components/dzieci/DzieckoKarta";

export const metadata: Metadata = {
  title: "Profile dzieci — Bajkowy Świat",
};

export default async function DzieciPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const dzieci = await prisma.childProfile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { stories: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Profile dzieci</h1>
          <p className="text-muted-foreground">
            Zarządzaj profilami dzieci, dla których tworzysz bajki.
          </p>
        </div>
        <Button asChild>
          <Link href="/dzieci/nowe">
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj dziecko
          </Link>
        </Button>
      </div>

      {dzieci.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 py-16 text-center">
          <span className="text-5xl">👶</span>
          <div>
            <p className="font-semibold text-slate-700">Brak profili dzieci</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Dodaj profil, żeby tworzyć spersonalizowane bajki.
            </p>
          </div>
          <Button asChild>
            <Link href="/dzieci/nowe">
              <PlusCircle className="mr-2 h-4 w-4" />
              Dodaj pierwsze dziecko
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dzieci.map((dziecko) => (
            <DzieckoKarta key={dziecko.id} dziecko={dziecko} />
          ))}
        </div>
      )}
    </div>
  );
}
