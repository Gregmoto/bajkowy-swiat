import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PustaStan from "@/components/shared/PustaStan";

// Widget ostatnich bajek na dashboardzie — lista 3 najnowszych
export default function OstatnieBajkiWidget() {
  // TODO: pobierz ostatnie 3 bajki z DB
  const bajki: unknown[] = [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Ostatnie bajki</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/biblioteka" className="flex items-center gap-1">
            Wszystkie <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bajki.length === 0 ? (
          <PustaStan
            emoji="📖"
            tytul="Brak bajek"
            opis="Stwórz pierwszą bajkę!"
            akcjaHref="/kreator"
            akcjaLabel="Kreator bajki"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
