import { prisma } from "@/lib/db";
import { StoryStatus, StoryTheme } from "@prisma/client";
import { Search } from "lucide-react";

const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka klasyczna", NATURE: "Przyroda",
};
const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  DRAFT:     "bg-amber-100 text-amber-700",
  ARCHIVED:  "bg-slate-100 text-slate-600",
};

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; theme?: string };
}) {
  const q      = searchParams.q      ?? "";
  const status = searchParams.status ?? "";
  const theme  = searchParams.theme  ?? "";

  const stories = await prisma.story.findMany({
    where: {
      AND: [
        q ? { title: { contains: q, mode: "insensitive" } } : {},
        status ? { status: status as StoryStatus } : {},
        theme  ? { theme:  theme  as StoryTheme  } : {},
      ],
    },
    include: {
      user:         { select: { email: true, name: true } },
      childProfile: { select: { name: true, age: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const total = await prisma.story.count();

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black text-slate-900">Bajki</h1>
          <p className="text-sm text-slate-500 mt-0.5">{stories.length} z {total} bajek</p>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap gap-3">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Szukaj po tytule…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-64 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {status && <input type="hidden" name="status" value={status} />}
            {theme  && <input type="hidden" name="theme"  value={theme}  />}
          </form>

          {/* Status */}
          <form method="GET" className="flex gap-1.5">
            {(["", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((s) => (
              <button key={s} name="status" value={s} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  status === s
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {s || "Wszystkie"}
              </button>
            ))}
            {q && <input type="hidden" name="q" value={q} />}
            {theme && <input type="hidden" name="theme" value={theme} />}
          </form>

          {/* Temat */}
          <form method="GET">
            <select
              name="theme"
              defaultValue={theme}
              onChange={(e) => e.currentTarget.form?.submit()}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:border-orange-400"
            >
              <option value="">Wszystkie tematy</option>
              {Object.entries(THEME_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            {q      && <input type="hidden" name="q"      value={q}      />}
            {status && <input type="hidden" name="status" value={status} />}
          </form>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tytuł</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rodzic</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dziecko</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Temat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stories.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                      Brak bajek dla podanych kryteriów.
                    </td>
                  </tr>
                )}
                {stories.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                      <p className="truncate">{s.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 truncate max-w-[140px]">{s.user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{s.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.childProfile.name}, {s.childProfile.age} lat
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {THEME_LABEL[s.theme] ?? s.theme}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">
                      {s.createdAt.toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/bajki/${s.id}`} className="text-xs text-orange-600 hover:underline font-medium">
                        Podgląd →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
