import { prisma } from "@/lib/db";
import { Gender } from "@prisma/client";
import { Search } from "lucide-react";

const GENDER_LABEL: Record<string, string> = { BOY: "Chłopiec", GIRL: "Dziewczynka", OTHER: "Inne" };
const GENDER_STYLE: Record<string, string> = {
  BOY:   "bg-blue-100 text-blue-700",
  GIRL:  "bg-pink-100 text-pink-700",
  OTHER: "bg-slate-100 text-slate-600",
};

export default async function AdminChildrenPage({
  searchParams,
}: {
  searchParams: { q?: string; gender?: string };
}) {
  const q      = searchParams.q      ?? "";
  const gender = searchParams.gender ?? "";

  const profiles = await prisma.childProfile.findMany({
    where: {
      AND: [
        q ? { name: { contains: q, mode: "insensitive" } } : {},
        gender ? { gender: gender as Gender } : {},
      ],
    },
    include: {
      user:   { select: { email: true, name: true } },
      _count: { select: { stories: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const total = await prisma.childProfile.count();

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black text-slate-900">Profile dzieci</h1>
          <p className="text-sm text-slate-500 mt-0.5">{profiles.length} z {total} profili</p>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap gap-3">
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Szukaj po imieniu…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-56 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {gender && <input type="hidden" name="gender" value={gender} />}
          </form>

          <form method="GET" className="flex gap-1.5">
            {([["", "Wszyscy"], ["BOY", "Chłopcy"], ["GIRL", "Dziewczynki"], ["OTHER", "Inne"]] as const).map(
              ([v, l]) => (
                <button key={v} name="gender" value={v} type="submit"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    gender === v
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {l}
                </button>
              )
            )}
            {q && <input type="hidden" name="q" value={q} />}
          </form>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dziecko</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Wiek</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Płeć</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Zainteresowania</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rodzic</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Bajki</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                      Brak profili dla podanych kryteriów.
                    </td>
                  </tr>
                )}
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.avatar ?? "🧒"}</span>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.age} lat</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${GENDER_STYLE[p.gender]}`}>
                        {GENDER_LABEL[p.gender]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.interests.slice(0, 3).map((i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                            {i}
                          </span>
                        ))}
                        {p.interests.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{p.interests.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/uzytkownicy/${p.userId}`} className="text-slate-700 hover:text-orange-600 hover:underline text-xs">
                        {p.user.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{p._count.stories}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">
                      {p.createdAt.toLocaleDateString("pl-PL")}
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
