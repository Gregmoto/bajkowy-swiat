export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, BookOpen, Calendar, Clock, Hash, User, Layers, Flag } from "lucide-react";
import Link from "next/link";
import AdminActionButton from "@/components/admin/AdminActionButton";
import StoryFlagButton from "@/components/admin/StoryFlagButton";
import StoryMetaForm from "@/components/admin/StoryMetaForm";
import { deleteStoryAdmin, changeStoryStatus } from "@/lib/actions/admin";

const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka klasyczna", NATURE: "Przyroda",
};
const THEME_BADGE: Record<string, string> = {
  ADVENTURE: "bg-amber-50 text-amber-700",    MAGIC:     "bg-violet-50 text-violet-700",
  FRIENDSHIP:"bg-pink-50 text-pink-700",      ANIMALS:   "bg-green-50 text-green-700",
  SPACE:     "bg-blue-50 text-blue-700",      FAIRY_TALE:"bg-orange-50 text-orange-700",
  NATURE:    "bg-teal-50 text-teal-700",
};
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PUBLISHED: { label: "Opublikowana", cls: "bg-emerald-100 text-emerald-700" },
  DRAFT:     { label: "Szkic",        cls: "bg-amber-100 text-amber-700"     },
  ARCHIVED:  { label: "Archiwum",     cls: "bg-slate-100 text-slate-500"     },
};
const GENDER_LABEL: Record<string, string> = {
  BOY: "Chłopiec", GIRL: "Dziewczynka", OTHER: "Inne",
};

export default async function AdminStoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    include: {
      user:         { select: { id: true, email: true, name: true } },
      childProfile: { select: { name: true, age: true, gender: true, avatar: true } },
      versions:     { orderBy: { version: "desc" }, take: 5 },
      tags:         true,
    },
  });

  if (!story) notFound();

  const st = STATUS_CFG[story.status] ?? { label: story.status, cls: "bg-slate-100 text-slate-600" };
  const wordCount = story.content?.split(/\s+/).filter(Boolean).length ?? 0;

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Wróć */}
        <Link
          href="/admin/bajki"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Wróć do listy bajek
        </Link>

        {/* ── Nagłówek ──────────────────────────────────────────────────── */}
        <div className={`rounded-2xl border p-5 ${story.flaggedForModeration ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              {story.flaggedForModeration && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                  <Flag className="h-3.5 w-3.5 fill-red-400" /> Oznaczona do moderacji
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>{st.label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${THEME_BADGE[story.theme] ?? "bg-slate-100 text-slate-600"}`}>
                  {THEME_LABEL[story.theme] ?? story.theme}
                </span>
                <span className="text-xs text-slate-400">v{story.versions[0]?.version ?? 1}</span>
                <span className="text-xs text-slate-400">{wordCount.toLocaleString("pl-PL")} słów</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">{story.title}</h1>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Utworzono: {story.createdAt.toLocaleDateString("pl-PL")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Akt.: {story.updatedAt.toLocaleDateString("pl-PL")}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" />
                  <code className="font-mono text-[10px] select-all">{story.id}</code>
                </span>
              </div>
            </div>

            {/* Akcje */}
            <div className="flex flex-col gap-3 shrink-0">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Zmień status</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((s) => (
                    <AdminActionButton
                      key={s}
                      label={STATUS_CFG[s].label}
                      action={() => changeStoryStatus(story.id, s)}
                      variant={story.status === s ? "success" : "default"}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StoryFlagButton storyId={story.id} flagged={story.flaggedForModeration} />
                <AdminActionButton
                  label="Usuń bajkę"
                  confirmMessage={`Trwale usunąć bajkę „${story.title}"? Tej operacji nie można cofnąć.`}
                  action={() => deleteStoryAdmin(story.id)}
                  variant="danger"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Siatka: meta + tagi ─────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Autor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Autor
            </h2>
            <div>
              <p className="font-semibold text-slate-800">{story.user.name}</p>
              <p className="text-xs text-slate-400 break-all">{story.user.email}</p>
            </div>
            <Link
              href={`/admin/uzytkownicy/${story.user.id}`}
              className="inline-block text-xs font-semibold text-orange-600 hover:underline"
            >
              Profil użytkownika →
            </Link>
          </div>

          {/* Dziecko */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Profil dziecka
            </h2>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{story.childProfile.avatar ?? "🧒"}</span>
              <div>
                <p className="font-semibold text-slate-800">{story.childProfile.name}</p>
                <p className="text-xs text-slate-400">
                  {story.childProfile.age} lat · {GENDER_LABEL[story.childProfile.gender] ?? story.childProfile.gender}
                </p>
              </div>
            </div>
          </div>

          {/* Tagi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Tagi
            </h2>
            {story.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {story.tags.map((t) => (
                  <span key={t.id} className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">
                    #{t.tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Brak tagów</p>
            )}
          </div>
        </div>

        {/* ── Edycja metadanych ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <StoryMetaForm
            storyId={story.id}
            title={story.title}
            moral={story.moral ?? ""}
            summary={story.summary ?? ""}
          />
        </div>

        {/* ── Treść bajki ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Treść bajki</h2>
            <span className="text-xs text-slate-400 tabular-nums">{wordCount.toLocaleString("pl-PL")} słów</span>
          </div>
          {story.content ? (
            <div className="prose prose-slate prose-sm max-w-none leading-relaxed whitespace-pre-wrap font-serif text-slate-700">
              {story.content}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-sm text-slate-400 italic">Brak treści — bajka jest szkicem bez wygenerowanej treści.</p>
            </div>
          )}
        </div>

        {/* ── Historia wersji ────────────────────────────────────────────── */}
        {story.versions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Historia wersji</h2>
            <div className="space-y-2">
              {story.versions.map((v, i) => (
                <div key={v.id} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${i === 0 ? "bg-orange-50 border border-orange-100" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${i === 0 ? "text-orange-700" : "text-slate-600"}`}>
                      v{v.version}
                    </span>
                    {i === 0 && (
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Aktualna</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="font-mono">{v.modelId ?? "unknown"}</span>
                    <span className="tabular-nums">{v.content.split(/\s+/).length.toLocaleString("pl-PL")} słów</span>
                    <span className="tabular-nums">{v.createdAt.toLocaleDateString("pl-PL")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
