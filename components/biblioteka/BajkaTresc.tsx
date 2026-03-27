import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MOTYWY_LABELS, MOTYWY_EMOJI } from "@/types";

interface Bajka {
  id: string; tytul: string; tresc: string; imie: string;
  wiek: number; plec: string; motyw: string; moral: string | null;
  ulubZwierze: string | null; ulubKolor: string | null;
  ulubZabawka: string | null; created: Date;
}

// Komponent pełnej treści bajki — tytuł, akapity, morał, tagi
export default function BajkaTresc({ bajka }: { bajka: Bajka }) {
  const akapity = bajka.tresc.split(/\n\n+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/biblioteka"><ArrowLeft className="mr-1.5 h-4 w-4" />Biblioteka</Link>
      </Button>

      <div className="space-y-3">
        <Badge variant="outline">
          {MOTYWY_EMOJI[bajka.motyw]} {MOTYWY_LABELS[bajka.motyw]}
        </Badge>
        <h1 className="text-3xl font-bold">{bajka.tytul}</h1>
        <p className="text-muted-foreground">
          {bajka.imie}, {bajka.wiek} lat · {formatDate(bajka.created)}
        </p>
      </div>

      <Separator />

      <article className="space-y-5 text-base leading-relaxed sm:text-lg">
        {akapity.map((p, i) => <p key={i}>{p}</p>)}
      </article>

      {bajka.moral && (
        <div className="rounded-xl border bg-primary/5 p-5">
          <p className="text-sm font-semibold text-primary">Morał bajki</p>
          <p className="text-sm text-muted-foreground italic">&ldquo;{bajka.moral}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
