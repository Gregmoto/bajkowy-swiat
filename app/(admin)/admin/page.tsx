export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import {
  Users, BookOpen, CreditCard, TrendingUp,
  AlertCircle, Clock, ShieldCheck, CheckCircle, XCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmt(n: number) { return n.toLocaleString("pl-PL"); }
function fmtZl(grosze: number) {
  return (grosze / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}
function delta(cur: number, prev: number) {
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

function StatCard({
  label, value, icon: Icon, iconBg, sub, trend, href,
}: {
  label: string; value: string | number; icon: React.ElementType;
  iconBg: string; sub?: string; trend?: number | null; href?: string;
}) {
  const inner = (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 tabular-nums">{value}</p>
      {(sub || trend !== undefined) && (
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {trend !== null && trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              <TrendingUp className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} />
              {trend >= 0 ? "+" : ""}{trend}% vs poprzedni
            </span>
          )}
          {sub && <span className="text-xs text-slate-400">{sub}</span>}
        </div>
      )}
    </div>
  );
  return href ? <a href={href} className="block hover:scale-[1.01] transition-transform">{inner}</a> : inner;
}

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sevenDaysAgo     = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo    = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    usersTotal,
    usersActive,
    usersThisMonth,
    usersLastMonth,
    storiesTotal,
    storiesThisMonth,
    storiesLastMonth,
    storiesLast7d,
    subCounts,
    paymentsTotal,
    revenueTotal,
    revenueLast30d,
    bannedCount,
    openReports,
    recentUsers,
    recentStories,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: false } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.story.count(),
    prisma.story.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.story.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.story.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.subscription.groupBy({ by: ["status"], _count: true }),
    prisma.payment.count({ where: { status: "SUCCEEDED" } }),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED", createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.user.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      include: { subscription: { select: { plan: true } } },
    }),
    prisma.story.findMany({
      take: 6, orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        childProfile: { select: { name: true } },
      },
    }),
    prisma.payment.findMany({
      take: 6, orderBy: { createdAt: "desc" }, where: { status: "SUCCEEDED" },
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const subMap       = Object.fromEntries(subCounts.map((s) => [s.status, s._count]));
  const activeSubs   = subMap["ACTIVE"]   ?? 0;
  const canceledSubs = subMap["CANCELED"] ?? 0;
  const totalRevenue = revenueTotal._sum.amount  ?? 0;
  const revenue30d   = revenueLast30d._sum.amount ?? 0;

  const PLAN_COLOR: Record<string, string> = {
    FREE:    "text-slate-600 bg-slate-100",
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {now.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {(bannedCount > 0 || openReports > 0) && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-sm text-amber-700">
                {openReports > 0 && <><strong>{openReports}</strong> otwartych zgłoszeń</>}
                {openReports > 0 && bannedCount > 0 && " · "}
                {bannedCount > 0 && <><strong>{bannedCount}</strong> zablokowanych kont</>}
              </span>
            </div>
          )}
        </div>

        {/* KPI — użytkownicy i bajki */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Użytkownicy i treści</p>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Wszyscy użytkownicy" value={fmt(usersTotal)} icon={Users}
              iconBg="bg-blue-50 text-blue-600" trend={delta(usersThisMonth, usersLastMonth)}
              sub={`+${usersThisMonth} ten mies.`} href="/admin/uzytkownicy" />
            <StatCard label="Aktywni użytkownicy" value={fmt(usersActive)} icon={CheckCircle}
              iconBg="bg-emerald-50 text-emerald-600"
              sub={bannedCount > 0 ? `${bannedCount} zablokowanych` : "brak zablokowanych"}
              href="/admin/uzytkownicy" />
            <StatCard label="Bajki łącznie" value={fmt(storiesTotal)} icon={BookOpen}
              iconBg="bg-orange-50 text-orange-600" trend={delta(storiesThisMonth, storiesLastMonth)}
              sub={`+${storiesThisMonth} ten mies.`} href="/admin/bajki" />
            <StatCard label="Nowe bajki (7 dni)" value={fmt(storiesLast7d)} icon={Clock}
              iconBg="bg-sky-50 text-sky-600" sub="ostatnie 7 dni" href="/admin/bajki" />
          </div>
        </div>

        {/* KPI — płatności i subskrypcje */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Płatności i subskrypcje</p>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Przychód łączny" value={fmtZl(totalRevenue)} icon={TrendingUp}
              iconBg="bg-emerald-50 text-emerald-600" sub={`${fmt(paymentsTotal)} płatności`} />
            <StatCard label="Przychód (30 dni)" value={fmtZl(revenue30d)} icon={CreditCard}
              iconBg="bg-violet-50 text-violet-600" sub="ostatnie 30 dni" />
            <StatCard label="Aktywne subskrypcje" value={fmt(activeSubs)} icon={CheckCircle}
              iconBg="bg-orange-50 text-orange-600" sub="status ACTIVE" href="/admin/subskrypcje" />
            <StatCard label="Anulowane subskrypcje" value={fmt(canceledSubs)} icon={XCircle}
              iconBg="bg-red-50 text-red-500" sub="status CANCELED" href="/admin/subskrypcje" />
          </div>
        </div>

        {/* Tabele */}
        <div className="grid gap-6 xl:grid-cols-2">

          {/* Ostatni zarejestrowani */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Ostatni użytkownicy</h2>
              <a href="/admin/uzytkownicy" className="text-xs text-orange-600 hover:underline">Wszyscy →</a>
            </div>
            <div className="divide-y divide-slate-50">
              {recentUsers.map((u) => (
                <a key={u.id} href={`/admin/uzytkownicy/${u.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                      {u.role === "ADMIN" && <ShieldCheck className="h-3.5 w-3.5 text-orange-500 shrink-0" />}
                      {u.isBanned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold">BAN</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLOR[u.subscription?.plan ?? "FREE"]}`}>
                      {u.subscription?.plan ?? "FREE"}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">{u.createdAt.toLocaleDateString("pl-PL")}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Ostatnie bajki */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Ostatnie bajki</h2>
              <a href="/admin/bajki" className="text-xs text-orange-600 hover:underline">Wszystkie →</a>
            </div>
            <div className="divide-y divide-slate-50">
              {recentStories.map((s) => (
                <a key={s.id} href={`/admin/bajki/${s.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.title}</p>
                    <p className="text-xs text-slate-400 truncate">{s.user.email} · {s.childProfile.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[s.status]}`}>{s.status}</span>
                    <span className="text-xs text-slate-400 tabular-nums">{s.createdAt.toLocaleDateString("pl-PL")}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Ostatnie płatności */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Ostatnie płatności</h2>
          </div>
          {recentPayments.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-400 text-center">Brak płatności w systemie.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Użytkownik</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Opis</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Kwota</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{p.user.name}</p>
                        <p className="text-xs text-slate-400">{p.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.description ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600 tabular-nums">{fmtZl(p.amount)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">{p.createdAt.toLocaleDateString("pl-PL")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Szybkie akcje */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">Szybkie akcje</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { href: "/admin/uzytkownicy", label: "Zarządzaj użytkownikami" },
              { href: "/admin/bajki",       label: "Przeglądaj bajki" },
              { href: "/admin/subskrypcje", label: "Subskrypcje" },
              { href: "/admin/zgloszenia",  label: openReports > 0 ? `Zgłoszenia (${openReports})` : "Zgłoszenia" },
              { href: "/admin/statystyki",  label: "Statystyki" },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
