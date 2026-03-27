import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Story, ChildProfile } from "@prisma/client";

type StoryWithProfile = Story & { childProfile: ChildProfile };

const THEME_EMOJI: Record<string, string> = {
  ADVENTURE: "⚔️", MAGIC: "✨", FRIENDSHIP: "🤝",
  ANIMALS: "🐾", SPACE: "🚀", FAIRY_TALE: "🏰", NATURE: "🌿",
};
const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka klasyczna", NATURE: "Przyroda",
};

export default function BajkaTresc({ story }: { story: StoryWithProfile }) {
  const akapity = (story.content ?? "").split(/\n\n+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/biblioteka">
          <ArrowLeft className="mr-1.5 h-4 w-4" />Biblioteka
        </Link>
      </Button>

      <div className="space-y-3">
        <Badge variant="outline">
          {THEME_EMOJI[story.theme]} {THEME_LABEL[story.theme]}
        </Badge>
        <h1 className="text-3xl font-bold">{story.title}</h1>
        <p className="text-muted-foreground">
          {story.childProfile.name}, {story.childProfile.age} lat · {formatDate(story.createdAt)}
        </p>
      </div>

      <Separator />

      <article className="space-y-5 text-base leading-relaxed sm:text-lg">
        {akapity.map((p, i) => <p key={i}>{p}</p>)}
      </article>

      {story.moral && (
        <div className="rounded-xl border bg-orange-50 p-5">
          <p className="text-sm font-bold text-orange-700">Morał bajki</p>
          <p className="text-sm text-slate-600 italic">&ldquo;{story.moral}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
