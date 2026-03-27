import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Dziecko {
  id: string;
  imie: string;
  wiek: number;
  plec: "chlopiec" | "dziewczynka";
  _count?: { bajki: number };
}

// Karta profilu dziecka — avatar, dane, liczba bajek, linki
export default function DzieckoKarta({ dziecko }: { dziecko: Dziecko }) {
  const avatar = dziecko.plec === "chlopiec" ? "👦" : "👧";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
            {avatar}
          </div>
          <div>
            <CardTitle className="text-base">{dziecko.imie}</CardTitle>
            <p className="text-sm text-muted-foreground">{dziecko.wiek} lat</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{dziecko._count?.bajki ?? 0} bajek</Badge>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link href={`/dzieci/${dziecko.id}`}>Zobacz profil</Link>
        </Button>
        <Button size="sm" asChild className="flex-1">
          <Link href={`/kreator?dziecko=${dziecko.id}`}>Nowa bajka</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
