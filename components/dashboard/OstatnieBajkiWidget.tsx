import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Story, ChildProfile } from "@prisma/client";

type BajkaZProfilem = Story & {
  childProfile: Pick<ChildProfile, "name" | "avatar">;
};

interface Props {
  bajki: BajkaZProfilem[];
}

const MOTYW_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda",
  MAGIC: "Magia",
  FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta",
  SPACE: "Kosmos",
  FAIRY_TALE: "Bajka",
  NATURE: "Przyroda",
};

function formatData(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export default function OstatnieBajkiWidget({ bajki }: Props) {
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
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <BookOpen className="h-10 w-10 text-slate-200" />
            <div>
              <p className="text-sm font-medium text-slate-600">Brak bajek</p>
              <p className="text-xs text-muted-foreground mt-1">
                Stwórz pierwszą bajkę dla swojego dziecka
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/kreator">Kreator bajki</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {bajki.map((bajka) => (
              <li key={bajka.id}>
                <Link
                  href={`/biblioteka/${bajka.id}`}
                  className="flex items-start gap-3 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-xl shrink-0">
                    {bajka.coverImage || "📖"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                      {bajka.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">
                        {bajka.childProfile.avatar || "🧒"}{" "}
                        {bajka.childProfile.name}
                      </span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {MOTYW_LABEL[bajka.theme] ?? bajka.theme}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 pt-0.5">
                    {formatData(bajka.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
