import Link from "next/link";
import { ArrowLeft, Pencil, BookOpen, Download, Wand2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UsunBajkeButton from "@/components/biblioteka/UsunBajkeButton";
import type { Story, ChildProfile } from "@prisma/client";

type StoryWithProfile = Story & { childProfile: ChildProfile };

const THEME_EMOJI: Record<string, string> = {
  ADVENTURE: "⚔️", MAGIC: "✨", FRIENDSHIP: "🤝",
  ANIMALS: "🐾",   SPACE: "🚀", FAIRY_TALE: "🌙", NATURE: "🌿",
};
const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda",   MAGIC: "Magia",            FRIENDSHIP: "Przyjaźń",
  ANIMALS:   "Zwierzęta",  SPACE: "Kosmos",            FAIRY_TALE: "Bajka na dobranoc",
  NATURE:    "Przyroda",
};
const THEME_BG: Record<string, string> = {
  ADVENTURE: "from-orange-50 via-amber-50 to-orange-100",
  MAGIC:     "from-purple-50 via-violet-50 to-purple-100",
  FRIENDSHIP:"from-pink-50 via-rose-50 to-pink-100",
  ANIMALS:   "from-green-50 via-emerald-50 to-green-100",
  SPACE:     "from-indigo-50 via-blue-50 to-indigo-100",
  FAIRY_TALE:"from-sky-50 via-blue-50 to-indigo-100",
  NATURE:    "from-green-50 via-teal-50 to-emerald-100",
};
const THEME_BORDER: Record<string, string> = {
  ADVENTURE: "border-orange-200", MAGIC: "border-purple-200", FRIENDSHIP: "border-pink-200",
  ANIMALS:   "border-green-200",  SPACE: "border-indigo-200", FAIRY_TALE: "border-sky-200",
  NATURE:    "border-emerald-200",
};
const THEME_ACCENT: Record<string, string> = {
  ADVENTURE: "text-orange-500",  MAGIC: "text-purple-500",  FRIENDSHIP: "text-pink-500",
  ANIMALS:   "text-green-600",   SPACE: "text-indigo-500",  FAIRY_TALE: "text-sky-500",
  NATURE:    "text-emerald-600",
};

function formatData(d: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(d));
}

function szacujCzas(tresc: string | null): string | null {
  if (!tresc) return null;
  const slowa = tresc.trim().split(/\s+/).length;
  const minuty = Math.max(1, Math.round(slowa / 130));
  return `ok. ${minuty} min czytania`;
}

function avatarDziecka(profile: ChildProfile): string {
  if (profile.avatar) return profile.avatar;
  if (profile.gender === "BOY") return "👦";
  if (profile.gender === "GIRL") return "👧";
  return "🧒";
}

export default function BajkaTresc({ story }: { story: StoryWithProfile }) {
  const akapity = (story.content ?? "").split(/\n\n+/).filter(Boolean);
  const isDraft = story.status === "DRAFT";
  const bg     = THEME_BG[story.theme]     ?? THEME_BG.ADVENTURE;
  const border = THEME_BORDER[story.theme] ?? THEME_BORDER.ADVENTURE;
  const accent = THEME_ACCENT[story.theme] ?? THEME_ACCENT.ADVENTURE;
  const czasCzytania = szacujCzas(story.content);

  return (
    <div className="mx-auto max-w-2xl">

      {/* Pasek nawigacji */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/biblioteka">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Biblioteka
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/biblioteka/${story.id}/edytuj`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edytuj
            </Link>
          </Button>
          <UsunBajkeButton bajkaId={story.id} tytul={story.title} />
        </div>
      </div>

      {/* ── OKŁADKA ── */}
      <div className={`rounded-t-3xl bg-gradient-to-br ${bg} border ${border} px-8 pt-10 pb-8 text-center space-y-4`}>
        {/* Emoji tematu */}
        <div className="flex justify-center">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/70 text-5xl shadow-sm"
            aria-hidden
          >
            {THEME_EMOJI[story.theme] ?? "📖"}
          </span>
        </div>

        {/* Tytuł */}
        <h1 className="text-3xl font-black leading-tight text-slate-900 max-w-md mx-auto">
          {story.title}
        </h1>

        {/* Dane dziecka */}
        <p className="text-sm text-slate-600">
          <span className="mr-1">{avatarDziecka(story.childProfile)}</span>
          <span className="font-medium">{story.childProfile.name}</span>
          <span className="text-slate-400">, {story.childProfile.age} lat</span>
        </p>

        {/* Metadane */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="bg-white/60 text-slate-700 border-white/80"
          >
            <span className="mr-1">{THEME_EMOJI[story.theme]}</span>
            {THEME_LABEL[story.theme]}
          </Badge>
          {isDraft && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
              Szkic
            </Badge>
          )}
          <span className="text-xs text-slate-400">{formatData(story.createdAt)}</span>
          {czasCzytania && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {czasCzytania}
            </span>
          )}
        </div>

        {/* Krótki opis */}
        {story.summary && (
          <p className="mx-auto max-w-md text-sm text-slate-600 italic leading-relaxed">
            {story.summary}
          </p>
        )}
      </div>

      {/* ── DEKORACYJNY SEPARATOR ── */}
      <div className={`border-x ${border} bg-white px-8 py-3 flex items-center gap-3`}>
        <div className="flex-1 h-px bg-slate-100" />
        <span className={`text-base ${accent}`}>✦</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* ── TREŚĆ ── */}
      <div className={`border-x ${border} bg-white px-8 pb-10 min-h-[8rem]`}>
        {isDraft && !story.content ? (
          /* Stan szkicu bez treści */
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50 py-14 text-center">
            <BookOpen className="h-10 w-10 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-800">Bajka jest jeszcze w przygotowaniu</p>
              <p className="mt-1 text-sm text-amber-700">
                Szkic został zapisany. Wróć do kreatora, aby wygenerować treść.
              </p>
            </div>
            <Button asChild>
              <Link href="/kreator">Wróć do kreatora</Link>
            </Button>
          </div>
        ) : (
          <article className="space-y-5 text-[1.0625rem] leading-[1.85] font-['Georgia',serif] text-slate-800">
            {akapity.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
        )}
      </div>

      {/* ── MORAŁ ── */}
      {story.moral && (
        <div className={`border-x ${border} border-t bg-slate-50/80 px-8 py-6`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accent} mb-2`}>
            Morał bajki
          </p>
          <blockquote className="border-l-4 border-orange-300 pl-4 text-slate-700 italic leading-relaxed text-sm">
            {story.moral}
          </blockquote>
        </div>
      )}

      {/* ── PASEK AKCJI ── */}
      <div className={`rounded-b-3xl border ${border} border-t-0 bg-white px-8 py-5 flex items-center justify-between gap-3`}>
        {/* PDF — placeholder */}
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Funkcja dostępna wkrótce"
          className="gap-1.5 opacity-60 cursor-not-allowed"
        >
          <Download className="h-3.5 w-3.5" />
          Pobierz PDF
          <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 leading-none">
            wkrótce
          </span>
        </Button>

        {/* Edytuj + Usuń */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/biblioteka/${story.id}/edytuj`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edytuj
            </Link>
          </Button>
          <UsunBajkeButton bajkaId={story.id} tytul={story.title} />
        </div>
      </div>

      {/* ── NAWIGACJA DOLNA ── */}
      <div className="flex items-center justify-between pt-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/biblioteka">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Biblioteka
          </Link>
        </Button>
        <Button asChild>
          <Link href="/kreator">
            <Wand2 className="mr-1.5 h-4 w-4" />
            Napisz kolejną bajkę
          </Link>
        </Button>
      </div>

    </div>
  );
}
