import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ChildProfile } from "@prisma/client";

interface Props {
  profile: ChildProfile[];
}

const AVATAR_FALLBACK: Record<string, string> = {
  BOY: "👦",
  GIRL: "👧",
  OTHER: "🧒",
};

export default function ProfileDzieciWidget({ profile }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Profile dzieci</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dzieci" className="flex items-center gap-1">
            Wszystkie <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {profile.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="text-3xl">👶</span>
            <p className="text-sm text-muted-foreground">
              Dodaj profil dziecka, żeby tworzyć bajki
            </p>
            <Button size="sm" asChild>
              <Link href="/dzieci/nowy">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Dodaj dziecko
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {profile.map((dziecko) => (
              <Link
                key={dziecko.id}
                href={`/dzieci/${dziecko.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-lg shrink-0">
                  {dziecko.avatar || AVATAR_FALLBACK[dziecko.gender] || "🧒"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {dziecko.name}
                  </p>
                  <p className="text-xs text-slate-400">{dziecko.age} lat</p>
                </div>
              </Link>
            ))}
            {profile.length < 4 && (
              <Link
                href="/dzieci/nowe"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-50 hover:text-orange-600 transition-colors"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-slate-200 text-lg">
                  <Plus className="h-4 w-4" />
                </span>
                Dodaj dziecko
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
