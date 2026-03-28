import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function groupByDay(items: { createdAt: Date }[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of items) {
    const day = item.createdAt.toISOString().split("T")[0];
    map[day] = (map[day] ?? 0) + 1;
  }
  return map;
}

function last30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className={`h-2 rounded-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka klasyczna", NATURE: "Przyroda",
};

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminStatsPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    recentUsers,
    recentStories,
    planCounts,
    themeCounts,
    statusCounts,
    totalUsers,
    totalStories,
    totalProfiles,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.story.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscription.groupBy({ by: ["plan"], _count: true }),
    prisma.story.groupBy({ by: ["theme"], _count: true, orderBy: { _count: { theme: "desc" } } }),
    prisma.story.groupBy({ by: ["status"], _count: true }),
    prisma.user.count(),
    prisma.story.count(),
    prisma.childProfile.count(),
  ]);

  const days = last30Days();
  const usersByDay    = groupByDay(recentUsers);
  const storiesByDay  = groupByDay(recentStories);
  const maxUsers      = Math.max(...days.map((d) => usersByDay[d] ?? 0), 1);
  const maxStories    = Math.max(...days.map((d) => storiesByDay[d] ?? 0), 1);

  const planMap   = Object.fromEntries(planCounts.map((p) => [p.plan, p._count]));
  const maxPlan   = Math.max(...planCounts.map((p) => p._count), 1);
  const maxTheme  = Math.max(...themeCounts.map((t) => t._count), 1);

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-black text-slate-900">Statystyki</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dane z ostatnich 30 dni i sumaryczne</p>
        </div>

        {/* Sumaryczne */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Użytkownicy łącznie",   value: totalUsers.toLocaleString("pl-PL") },
            { label: "Bajki łącznie",          value: totalStories.toLocaleString("pl-PL") },
            { label: "Profile dzieci łącznie", value: totalProfiles.toLocaleString("pl-PL") },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">

          {/* Rejestracje — ostatnie 30 dni */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-700 mb-1">Nowi użytkownicy — ostatnie 30 dni</h2>
            <p className="text-xs text-slate-400 mb-4">Łącznie: {recentUsers.length}</p>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {days.filter((d) => (usersByDay[d] ?? 0) > 0 || d === days[days.length - 1]).map((day) => {
                const count = usersByDay[day] ?? 0;
                return (
                  <div key={day} className="grid grid-cols-[80px_1fr_28px] items-center gap-2">
                    <span className="text-xs text-slate-400 tabular-nums">{formatDay(day)}</span>
                    <Bar value={count} max={maxUsers} color="bg-blue-400" />
                    <span className="text-xs font-mono text-slate-600 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bajki — ostatnie 30 dni */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-700 mb-1">Nowe bajki — ostatnie 30 dni</h2>
            <p className="text-xs text-slate-400 mb-4">Łącznie: {recentStories.length}</p>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {days.filter((d) => (storiesByDay[d] ?? 0) > 0 || d === days[days.length - 1]).map((day) => {
                const count = storiesByDay[day] ?? 0;
                return (
                  <div key={day} className="grid grid-cols-[80px_1fr_28px] items-center gap-2">
                    <span className="text-xs text-slate-400 tabular-nums">{formatDay(day)}</span>
                    <Bar value={count} max={maxStories} color="bg-orange-400" />
                    <span className="text-xs font-mono text-slate-600 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rozkład planów */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-700 mb-4">Rozkład planów subskrypcji</h2>
            <div className="space-y-3">
              {[
                { plan: "FREE",    color: "bg-slate-400" },
                { plan: "STARTER", color: "bg-orange-400" },
                { plan: "PREMIUM", color: "bg-violet-500" },
              ].map(({ plan, color }) => {
                const count = planMap[plan] ?? 0;
                const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                return (
                  <div key={plan} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{plan}</span>
                      <span className="text-slate-400 tabular-nums">{count.toLocaleString("pl-PL")} ({pct}%)</span>
                    </div>
                    <Bar value={count} max={maxPlan} color={color} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tematy bajek */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-700 mb-4">Tematy bajek</h2>
            <div className="space-y-3">
              {themeCounts.map(({ theme, _count: count }) => (
                <div key={theme} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{THEME_LABEL[theme] ?? theme}</span>
                    <span className="text-slate-400 tabular-nums">{count}</span>
                  </div>
                  <Bar value={count} max={maxTheme} color="bg-orange-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status bajek */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-black text-slate-700 mb-4">Statusy bajek</h2>
          <div className="flex flex-wrap gap-4">
            {statusCounts.map(({ status, _count: count }) => (
              <div key={status} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className={`h-3 w-3 rounded-full ${
                  status === "PUBLISHED" ? "bg-emerald-400"
                  : status === "DRAFT" ? "bg-amber-400"
                  : "bg-slate-400"
                }`} />
                <div>
                  <p className="text-xs font-semibold text-slate-600">{status}</p>
                  <p className="text-lg font-black text-slate-900 tabular-nums">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
