export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { StoryStatus, StoryTheme } from "@prisma/client";
import { Search, BookOpen, Flag } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import StoryFlagButton from "@/components/admin/StoryFlagButton";

// ---------------------------------------------------------------------------
// Stałe
// ---------------------------------------------------------------------------
const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka klasyczna", NATURE: "Przyroda",
};
const THEME_BADGE: Record<string, string> = {
  ADVENTURE: "bg-amber-50 text-amber-700",   MAGIC:    "bg-violet-50 text-violet-700",
  FRIENDSHIP:"bg-pink-50 text-pink-700",     ANIMALS:  "bg-green-50 text-green-700",
  SPACE:     "bg-blue-50 text-blue-700",     FAIRY_TALE:"bg-orange-50 text-orange-700",
  NATURE:    "bg-teal-50 text-teal-700",
};
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PUBLISHED: { label: "Opublikowana", cls: "bg-emerald-100 text-emerald-700" },
  DRAFT:     { label: "Szkic",        cls: "bg-amber-100 text-amber-700"     },
  ARCHIVED:  { label: "Archiwum",     cls: "bg-slate-100 text-slate-500"     },
};
const PER_PAGE = 25;

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; theme?: string; flagged?: string; page?: string };
}) {
  const q       = searchParams.q       ?? "";
  const status  = searchParams.status  ?? "";
  const theme   = searchParams.theme   ?? "";
  const flagged = searchParams.flagged ?? "";
  const page    = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip    = (page - 1) * PER_PAGE;

  const where = {
    AND: [
      q       ? { title: { contains: q, mode: "insensitive" as const } } : {},
      status  ? { status: status as StoryStatus }                         : {},
      theme   ? { theme:  theme  as StoryTheme  }                         : {},
      flagged === "1" ? { flaggedForModeration: true }                    : {},
    ],
  };

  const [stories, total, totalAll, flaggedCount] = await Promise.all([
    prisma.story.findMany({
      where,
      include: {
        user:         { select: { id: true, email: true, name: true } },
        childProfile: { select: { name: true, age: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
    }),
    prisma.story.count({ where }),
    prisma.story.count(),
    prisma.story.count({ where: { flaggedForModeration: true } }),
  ]);

  // Buduj href paginacji z aktualnymi filtrami
  const filterParts: string[] = [];
  if (q)                filterParts.push(`q=${encodeURIComponent(q)}`);
  if (status)           filterParts.push(`status=${status}`);
  if (theme)            filterParts.push(`theme=${theme}`);
  if (flagged === "1")  filterParts.push(`flagged=1`);
  const filterQs   = filterParts.length ? `?${filterParts.join("&")}&` : "?";
  const paginHref  = `/admin/bajki${filterQs}`;

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Nagłówek */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Bajki</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total.toLocaleString("pl-PL")} wyników
              {totalAll !== total && ` z ${totalAll.toLocaleString("pl-PL")} łącznie`}
              {flaggedCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                  <Flag className="h-3 w-3 fill-red-400" /> {flaggedCount} do moderacji
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ── Filtry ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">

          {/* Wyszukiwanie */}
          <form method="GET" className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Szukaj po tytule…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-colors"
              />
            </div>
            {status  && <input type="hidden" name="status"  value={status}  />}
            {theme   && <input type="hidden" name="theme"   value={theme}   />}
            {flagged === "1" && <input type="hidden" name="flagged" value="1" />}
            <button type="submit" className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
              Szukaj
            </button>
            {(q || status || theme || flagged === "1") && (
              <Link href="/admin/bajki" className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Wyczyść
              </Link>
            )}
          </form>

          {/* Taby status + temat + moderacja */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status */}
            <form method="GET" className="flex gap-1">
              {(["", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((s) => (
                <button key={s} name="status" value={s} type="submit"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    status === s
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {s ? STATUS_CFG[s]?.label ?? s : "Wszystkie"}
                </button>
              ))}
              {q      && <input type="hidden" name="q"      value={q}      />}
              {theme  && <input type="hidden" name="theme"  value={theme}  />}
              {flagged === "1" && <input type="hidden" name="flagged" value="1" />}
            </form>

            <div className="h-4 w-px bg-slate-200" />

            {/* Temat */}
            <form method="GET">
              <select name="theme" defaultValue={theme}
                onChange={(e) => e.currentTarget.form?.submit()}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:border-orange-400 cursor-pointer"
              >
                <option value="">Wszystkie tematy</option>
                {Object.entries(THEME_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              {q      && <input type="hidden" name="q"      value={q}      />}
              {status && <input type="hidden" name="status" value={status} />}
              {flagged === "1" && <input type="hidden" name="flagged" value="1" />}
            </form>

            {/* Moderacja */}
            <form method="GET">
              <button type="submit" name="flagged" value={flagged === "1" ? "" : "1"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  flagged === "1"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-600"
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${flagged === "1" ? "fill-white" : ""}`} />
                Do moderacji {flaggedCount > 0 && `(${flaggedCount})`}
              </button>
              {q      && <input type="hidden" name="q"      value={q}      />}
              {status && <input type="hidden" name="status" value={status} />}
              {theme  && <input type="hidden" name="theme"  value={theme}  />}
            </form>
          </div>
        </div>

        {/* ── Tabela ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {stories.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Brak bajek"
              description={q || status || theme || flagged === "1"
                ? "Żadna bajka nie pasuje do podanych filtrów."
                : "W systemie nie ma jeszcze żadnych bajek."}
              action={
                (q || status || theme || flagged === "1") ? (
                  <Link href="/admin/bajki" className="text-sm text-orange-600 hover:underline font-semibold">
                    Wyczyść filtry
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">ID</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">Tytuł</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">Użytkownik</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">Dziecko</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">Temat</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">Utworzono</th>
                    <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-wide">Akt.</th>
                    <th className="px-4 py-3 text-right text-[11px] font-black text-slate-400 uppercase tracking-wide">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stories.map((s) => {
                    const st = STATUS_CFG[s.status] ?? { label: s.status, cls: "bg-slate-100 text-slate-600" };
                    return (
                      <tr key={s.id} className={`hover:bg-slate-50/70 transition-colors group ${s.flaggedForModeration ? "bg-red-50/30" : ""}`}>
                        {/* ID */}
                        <td className="px-4 py-3">
                          <code className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded select-all">
                            {s.id.slice(0, 8)}…
                          </code>
                        </td>

                        {/* Tytuł */}
                        <td className="px-4 py-3 max-w-[180px]">
                          <div className="flex items-center gap-1.5">
                            {s.flaggedForModeration && (
                              <Flag className="h-3 w-3 text-red-500 fill-red-400 shrink-0" />
                            )}
                            <Link
                              href={`/admin/bajki/${s.id}`}
                              className="font-semibold text-slate-800 hover:text-orange-600 truncate block transition-colors"
                            >
                              {s.title}
                            </Link>
                          </div>
                        </td>

                        {/* Użytkownik */}
                        <td className="px-4 py-3">
                          <Link href={`/admin/uzytkownicy/${s.user.id}`} className="hover:text-orange-600 transition-colors">
                            <p className="text-slate-700 font-medium truncate max-w-[130px]">{s.user.name}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{s.user.email}</p>
                          </Link>
                        </td>

                        {/* Dziecko */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {s.childProfile.avatar && (
                              <span className="text-base leading-none">{s.childProfile.avatar}</span>
                            )}
                            <span className="text-slate-600 text-xs">
                              {s.childProfile.name}, {s.childProfile.age} l.
                            </span>
                          </div>
                        </td>

                        {/* Temat */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${THEME_BADGE[s.theme] ?? "bg-slate-100 text-slate-600"}`}>
                            {THEME_LABEL[s.theme] ?? s.theme}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>

                        {/* Daty */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs text-slate-500 tabular-nums">{s.createdAt.toLocaleDateString("pl-PL")}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs text-slate-400 tabular-nums">{s.updatedAt.toLocaleDateString("pl-PL")}</p>
                        </td>

                        {/* Akcje */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <StoryFlagButton storyId={s.id} flagged={s.flaggedForModeration} />
                            <Link
                              href={`/admin/bajki/${s.id}`}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                            >
                              Podgląd →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginacja */}
        {total > PER_PAGE && (
          <Pagination page={page} total={total} perPage={PER_PAGE} baseHref={paginHref} />
        )}

      </div>
    </main>
  );
}
