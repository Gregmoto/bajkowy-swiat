export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { deleteStoryAdmin, changeStoryStatus } from "@/lib/actions/admin";

const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka klasyczna", NATURE: "Przyroda",
};

export default async function AdminStoryDetailPage({ params }: { params: { id: string } }) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    include: {
      user:         { select: { id: true, email: true, name: true } },
      childProfile: { select: { name: true, age: true, gender: true, avatar: true } },
      versions:     { orderBy: { version: "desc" }, take: 5 },
    },
  });

  if (!story) notFound();

  const GENDER_LABEL: Record<string, string> = { BOY: "Chłopiec", GIRL: "Dziewczynka", OTHER: "Inne" };

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <a href="/admin/bajki" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Wróć do listy bajek
        </a>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{story.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {THEME_LABEL[story.theme]} · {story.language.toUpperCase()} ·
              Wersja {story.versions[0]?.version ?? 1} ·
              Dodana: {story.createdAt.toLocaleDateString("pl-PL")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {(["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((s) => (
              <AdminActionButton
                key={s}
                label={s}
                action={() => changeStoryStatus(story.id, s)}
                variant={story.status === s ? "success" : "default"}
                className={story.status === s ? "ring-2 ring-emerald-300" : ""}
              />
            ))}
            <AdminActionButton
              label="Usuń bajkę"
              confirmMessage={`Trwale usunąć bajkę „${story.title}"?`}
              action={() => deleteStoryAdmin(story.id)}
              variant="danger"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Autor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">Autor</h2>
            <div>
              <p className="font-semibold text-slate-800">{story.user.name}</p>
              <p className="text-xs text-slate-400">{story.user.email}</p>
            </div>
            <a href={`/admin/uzytkownicy/${story.user.id}`}
              className="inline-block text-xs text-orange-600 hover:underline">
              Profil użytkownika →
            </a>
          </div>

          {/* Dziecko */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">Dziecko</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{story.childProfile.avatar ?? "🧒"}</span>
              <div>
                <p className="font-semibold text-slate-800">{story.childProfile.name}</p>
                <p className="text-xs text-slate-400">
                  {story.childProfile.age} lat · {GENDER_LABEL[story.childProfile.gender]}
                </p>
              </div>
            </div>
          </div>

          {/* Metadane */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">Metadane</h2>
            {story.moral && (
              <div>
                <p className="text-xs text-slate-400">Morał</p>
                <p className="text-sm text-slate-700 italic">„{story.moral}"</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                story.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700"
                : story.status === "DRAFT" ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
              }`}>
                {story.status}
              </span>
              <span className="text-xs text-slate-400">v{story.versions[0]?.version ?? 1}</span>
            </div>
          </div>
        </div>

        {/* Treść */}
        {story.summary && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Streszczenie</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{story.summary}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-7">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Treść bajki</h2>
          {story.content ? (
            <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap font-serif">
              {story.content}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Brak treści (bajka w wersji roboczej).</p>
          )}
        </div>

        {/* Historia wersji */}
        {story.versions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Historia wersji</h2>
            <div className="space-y-2">
              {story.versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                  <span className="text-sm font-semibold text-slate-700">Wersja {v.version}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{v.modelId ?? "unknown"}</span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {v.createdAt.toLocaleDateString("pl-PL")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {v.content.split(/\s+/).length} słów
                    </span>
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
