import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import KreatorBajki from "@/components/kreator/KreatorBajki";

export const metadata: Metadata = {
  title: "Kreator bajki — Bajkowy Świat",
};

interface Props {
  searchParams: { dziecko?: string };
}

export default async function KreatorPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.childProfile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      {/* Nagłówek */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700">
          <Sparkles className="h-4 w-4" />
          Kreator bajek
        </div>
        <h1 className="text-3xl font-black">Stwórz nową bajkę</h1>
        <p className="text-muted-foreground">
          Wypełnij formularz, a AI napisze wyjątkową historię dla Twojego dziecka.
        </p>
      </div>

      {/* Formularz */}
      <KreatorBajki
        profile={profile}
        defaultChildProfileId={searchParams.dziecko}
      />
    </div>
  );
}
