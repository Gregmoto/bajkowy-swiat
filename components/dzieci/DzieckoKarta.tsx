import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChildProfile } from "@prisma/client";

type DzieckoZLicznikiem = ChildProfile & {
  _count: { stories: number };
};

const AVATAR_FALLBACK: Record<string, string> = {
  BOY: "👦",
  GIRL: "👧",
  OTHER: "🧒",
};

const PLEC_LABEL: Record<string, string> = {
  BOY: "chłopiec",
  GIRL: "dziewczynka",
  OTHER: "inne",
};

export default function DzieckoKarta({ dziecko }: { dziecko: DzieckoZLicznikiem }) {
  const avatar = dziecko.avatar || AVATAR_FALLBACK[dziecko.gender] || "🧒";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-2xl">
            {avatar}
          </div>
          <div>
            <CardTitle className="text-base">{dziecko.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dziecko.age} lat • {PLEC_LABEL[dziecko.gender] ?? dziecko.gender}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge variant="secondary">
          {dziecko._count.stories}{" "}
          {dziecko._count.stories === 1 ? "bajka" : "bajek"}
        </Badge>
        {dziecko.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {dziecko.interests.slice(0, 3).map((z) => (
              <span
                key={z}
                className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {z}
              </span>
            ))}
            {dziecko.interests.length > 3 && (
              <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                +{dziecko.interests.length - 3}
              </span>
            )}
          </div>
        )}
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
