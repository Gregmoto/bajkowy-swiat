import { prisma } from "@/lib/db";
import {
  Users, BookOpen, Baby, CreditCard,
  TrendingUp, AlertCircle, Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) {
  return n.toLocaleString("pl-PL");
}

function delta(current: number, prev: number) {
  if (prev === 0) return null;
  const pct = Math.round(((current - prev) / prev) * 100);
  return pct;
}

function StatCard({
  label, value, icon: Icon, iconBg, sub, trend,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  sub?: string;
  trend?: number | null;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 tabular-nums">{value}</p>
      {(sub || trend !== undefined) && (
        <div className="mt-1.5 flex items-center gap-2">
          {trend !== null && trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              <TrendingUp className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} />
              {trend >= 0 ? "+" : ""}{trend}% vs poprzedni mies.
            </span>
          )}
          {sub && <span className="text-xs text-slate-400">{sub}</span>}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">{children}</h2>;
}

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    usersTotal,
    usersThisMonth,
    usersLastMonth,
    storiesTotal,
    storiesThisMonth,
    storiesLastMonth,
    planCounts,
    recentUsers,
    recentStories,
    bannedCount,
    openReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.story.count(),
    prisma.story.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.story.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.subscription.groupBy({ by: ["plan"], _count: true }),
    prisma.user.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { subscription: { select: { plan: true } } },
    }),
    prisma.story.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        childProfile: { select: { name: true } },
      },
    }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);

  const planMap = Object.fromEntries(planCounts.map((p) => [p.plan, p._count]));
  const starterCount = planMap["STARTER"] ?? 0;
  const premiumCount = planMap["PREMIUM"] ?? 0;
  const mrr = starterCount * 19 + premiumCount * 49;

  const PLAN_LABEL: Record<string, string> = {
    FREE: "Free", STARTER: "Starter", PREMIUM: "Premium",
  };
  const PLAN_COLOR: Record<string, string> = {
    FREE: "text-slate-600 bg-slate-100",
    STARTER: "text-orange-700 bg-orange-100",
    PREMIUM: "text-violet-700 bg-violet-100",
  };
  const STATUS_COLOR: Record<string, string> = {
    PUBLISHED: "text-emerald-700 bg-emerald-100",
    DRAFT:     "text-amber-700 bg-amber-100",
    ARCHIVED:  "text-slate-600 bg-slate-100",
  };

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Przegląd platformy — {now.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {(bannedCount > 0 || openReports > 0) && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                {openReports > 0 && <><strong>{openReports}</strong> otwartych zgłoszeń</>}
                {openReports > 0 && bannedCount > 0 && " · "}
                {bannedCount > 0 && <><strong>{bannedCount}</strong> zablokowanych kont</>}
              </span>
            </div>
          )}
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Użytkownicy"
            value={fmt(usersTotal)}
            icon={Users}
            iconBg="bg-blue-50 text-blue-600"
            trend={delta(usersThisMonth, usersLastMonth)}
            sub={`+${usersThisMonth} ten mies.`}
          />
          <StatCard
            label="Bajki"
            value={fmt(storiesTotal)}
            icon={BookOpen}
            iconBg="bg-orange-50 text-orange-600"
            trend={delta(storiesThisMonth, storiesLastMonth)}
            sub={`+${storiesThisMonth} ten mies.`}
          />
          <StatCard
            label="Aktywne plany"
            value={starterCount + premiumCount}
            icon={CreditCard}
            iconBg="bg-violet-50 text-violet-600"
            sub={`Starter: ${starterCount} · Premium: ${premiumCount}`}
          />
          <StatCard
            label="MRR (est.)"
            value={`${fmt(mrr)} zł`}
            icon={TrendingUp}
            iconBg="bg-emerald-50 text-emerald-600"
            sub={`${fmt(planMap["FREE"] ?? 0)} użytk. FREE`}
          />
        </div>

        {/* Tabele */}
        <div className="grid gap-6 xl:grid-cols-2">

          {/* Ostatni zarejestrowani */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <SectionTitle>Ostatni użytkownicy</SectionTitle>
              <a href="/admin/uzytkownicy" className="text-xs text-orange-600 hover:underline">
                Zobacz wszystkich →
              </a>
            </div>
            <div className="divide-y divide-slate-50">
              {recentUsers.map((u) => (
                <a
                  key={u.id}
                  href={`/admin/uzytkownicy/${u.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    {u.isBanned && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 font-semibold">BAN</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLOR[u.subscription?.plan ?? "FREE"]}`}>
                      {PLAN_LABEL[u.subscription?.plan ?? "FREE"]}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {u.createdAt.toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Ostatnie bajki */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <SectionTitle>Ostatnie bajki</SectionTitle>
              <a href="/admin/bajki" className="text-xs text-orange-600 hover:underline">
                Zobacz wszystkie →
              </a>
            </div>
            <div className="divide-y divide-slate-50">
              {recentStories.map((s) => (
                <a
                  key={s.id}
                  href={`/admin/bajki/${s.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {s.user.email} · {s.childProfile.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[s.status]}`}>
                      {s.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {s.createdAt.toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Plan distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <SectionTitle>Rozkład planów subskrypcji</SectionTitle>
          <div className="space-y-3 mt-4">
            {[
              { plan: "FREE",    count: planMap["FREE"] ?? 0,    color: "bg-slate-400" },
              { plan: "STARTER", count: planMap["STARTER"] ?? 0, color: "bg-orange-400" },
              { plan: "PREMIUM", count: planMap["PREMIUM"] ?? 0, color: "bg-violet-500" },
            ].map(({ plan, count, color }) => {
              const pct = usersTotal > 0 ? Math.round((count / usersTotal) * 100) : 0;
              return (
                <div key={plan} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{PLAN_LABEL[plan]}</span>
                    <span className="text-slate-500">{fmt(count)} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
