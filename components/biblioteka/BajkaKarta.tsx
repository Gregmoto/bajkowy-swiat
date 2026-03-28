import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UsunBajkeButton from "@/components/biblioteka/UsunBajkeButton";
import type { Story, ChildProfile } from "@prisma/client";

type BajkaZProfilem = Story & { childProfile: Pick<ChildProfile, "name" | "avatar" | "gender"> };

const THEME_EMOJI: Record<string, string> = {
  ADVENTURE: "⚔️", MAGIC: "✨", FRIENDSHIP: "🤝",
  ANIMALS: "🐾",   SPACE: "🚀", FAIRY_TALE: "🌙", NATURE: "🌿",
};
const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Dobranoc", NATURE: "Przyroda",
};
const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Gotowa", DRAFT: "Szkic", ARCHIVED: "Archiwum",
};
const STATUS_CLASS: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT:     "bg-amber-50 text-amber-700 border-amber-200",
  ARCHIVED:  "bg-slate-100 text-slate-500 border-slate-200",
};
const AVATAR_FALLBACK: Record<string, string> = { BOY: "👦", GIRL: "👧", OTHER: "🧒" };

function formatData(d: Date) {
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

export default function BajkaKarta({ bajka }: { bajka: BajkaZProfilem }) {
  const avatar = bajka.childProfile.avatar || AVATAR_FALLBACK[bajka.childProfile.gender] || "🧒";
  const podglad = (bajka.summary || bajka.content || "").slice(0, 100).trim();

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 gap-4 hover:shadow-md hover:border-slate-300 transition-all">
      {/* Nagłówek */}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-2xl">
          {THEME_EMOJI[bajka.theme] ?? "📖"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-slate-900 leading-snug line-clamp-2 text-sm">
            {bajka.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs text-slate-400">
              {avatar} {bajka.childProfile.name}
            </span>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-400">
              {THEME_LABEL[bajka.theme] ?? bajka.theme}
            </span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[bajka.status] ?? STATUS_CLASS.DRAFT}`}>
          {STATUS_LABEL[bajka.status] ?? bajka.status}
        </span>
      </div>

      {/* Podgląd treści */}
      {podglad && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {podglad}{podglad.length >= 100 ? "…" : ""}
        </p>
      )}

      {/* Stopka */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <span className="text-xs text-slate-400">{formatData(bajka.createdAt)}</span>

        <div className="flex items-center gap-1">
          <Link
            href={`/biblioteka/${bajka.id}`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Czytaj
          </Link>
          <Link
            href={`/biblioteka/${bajka.id}/edytuj`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edytuj
          </Link>
          <UsunBajkeButton bajkaId={bajka.id} tytul={bajka.title} />
        </div>
      </div>
    </div>
  );
}
