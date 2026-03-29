import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

function fmtPLN(grosz: number) {
  return (grosz / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

function pct(part: number, total: number) {
  if (total === 0) return "0,0%";
  return ((part / total) * 100).toFixed(1).replace(".", ",") + "%";
}

// ---------------------------------------------------------------------------
// Komponenty UI
// ---------------------------------------------------------------------------
function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "blue" | "orange" | "green" | "violet" | "rose" | "amber";
}) {
  const dot: Record<string, string> = {
    blue:   "bg-blue-400",
    orange: "bg-orange-400",
    green:  "bg-emerald-400",
    violet: "bg-violet-500",
    rose:   "bg-rose-400",
    amber:  "bg-amber-400",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {accent && <span className={`h-2 w-2 rounded-full shrink-0 ${dot[accent]}`} />}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none">{label}</p>
      </div>
      <p className="text-2xl font-black text-slate-900 tabular-nums mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pctW = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <div className="space-y-1 min-w-0">
        <span className="text-xs text-slate-500 truncate block">{label}</span>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pctW}%` }} />
        </div>
      </div>
      <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">{value.toLocaleString("pl-PL")}</span>
    </div>
  );
}

function DayChart({ days, byDay, maxVal, color, label, total }: {
  days: string[]; byDay: Record<string, number>; maxVal: number;
  color: string; label: string; total: number;
}) {
  const visible = days.slice(-14);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-black text-slate-700">{label}</h2>
        <span className="text-xs text-slate-400">Łącznie (30 dni): {total}</span>
      </div>
      <div className="flex items-end gap-1 h-28">
        {visible.map((day) => {
          const count = byDay[day] ?? 0;
          const h = maxVal > 0 ? Math.max(4, Math.round((count / maxVal) * 100)) : 4;
          return (
            <div key={day} className="flex-1 relative group">
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 pointer-events-none">
                {formatDay(day)}: {count}
              </span>
              <div className={`w-full rounded-t ${color}`} style={{ height: `${h}%` }} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-slate-400">{formatDay(visible[0])}</span>
        <span className="text-[10px] text-slate-400">{formatDay(visible[visible.length - 1])}</span>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <h2 className="text-base font-black text-slate-900 whitespace-nowrap">{children}</h2>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function GrowthBadge({ p }: { p: string | null }) {
  if (!p) return null;
  const n = parseInt(p);
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${n >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
      {n >= 0 ? "+" : ""}{p}% vs poprzedni miesiąc
    </span>
  );
}

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminStatsPage() {
  const now            = new Date();
  const today          = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo   = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalUsers,        usersToday,       usersThisWeek,    usersThisMonth,
    usersPrevMonth,    activeUsers30d,   activeUsers7d,    returningUsers,
    totalStories,      storiesToday,     storiesThisWeek,  storiesThisMonth,
    storiesPrevMonth,
    revenueTotal,      revenueThisMonth, revenuePrevMonth,
    usersWithStories,  usersWithPayments,
    recentUsers30d,    recentStories30d,
    planCounts,        subStatusCounts,  canceledThisMonth, billingPeriodCounts,
    themeCounts,       storyStatusCounts, paymentMethodCounts,
    totalProfiles,     totalRevenuePayers,
  ] = await Promise.all([
    // Użytkownicy
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
    // Powracający: zarejestrowani >7 dni temu + aktywni w ost. 30 dni
    prisma.user.count({ where: { createdAt: { lte: sevenDaysAgo }, lastActiveAt: { gte: thirtyDaysAgo } } }),

    // Bajki
    prisma.story.count(),
    prisma.story.count({ where: { createdAt: { gte: today } } }),
    prisma.story.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.story.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.story.count({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),

    // Przychód
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),

    // Konwersje
    prisma.user.count({ where: { stories:  { some: {} } } }),
    prisma.user.count({ where: { payments: { some: { status: "SUCCEEDED" } } } }),

    // Wykresy
    prisma.user.findMany({  where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    prisma.story.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),

    // Rozkłady
    prisma.subscription.groupBy({ by: ["plan"],          _count: true }),
    prisma.subscription.groupBy({ by: ["status"],        _count: true }),
    prisma.subscription.count({ where: { status: "CANCELED", canceledAt: { gte: startOfMonth } } }),
    prisma.subscription.groupBy({ by: ["billingPeriod"], _count: true }),
    prisma.story.groupBy({ by: ["theme"],  _count: true, orderBy: { _count: { theme:  "desc" } } }),
    prisma.story.groupBy({ by: ["status"], _count: true }),
    prisma.payment.groupBy({ by: ["paymentMethod"], _count: true, where: { status: "SUCCEEDED" } }),

    // Inne
    prisma.childProfile.count(),
    prisma.payment.groupBy({ by: ["userId"], _count: true, where: { status: "SUCCEEDED" } }).then((r) => r.length),
  ]);

  // ---------------------------------------------------------------------------
  // Metryki pochodne
  // ---------------------------------------------------------------------------
  const totalRev  = revenueTotal._sum.amount     ?? 0;
  const monthRev  = revenueThisMonth._sum.amount ?? 0;
  const prevRev   = revenuePrevMonth._sum.amount ?? 0;
  const arpu      = totalRevenuePayers > 0 ? totalRev / totalRevenuePayers : 0;
  const arpuAll   = totalUsers > 0 ? totalRev / totalUsers : 0;
  const convStory = totalUsers > 0 ? (usersWithStories  / totalUsers) * 100 : 0;
  const convPay   = totalUsers > 0 ? (usersWithPayments / totalUsers) * 100 : 0;

  function gPct(cur: number, prev: number): string | null {
    return prev === 0 ? null : ((cur - prev) / prev * 100).toFixed(0);
  }

  // Wykresy
  const days       = last30Days();
  const usersByDay = groupByDay(recentUsers30d);
  const storByDay  = groupByDay(recentStories30d);
  const maxU       = Math.max(...days.map((d) => usersByDay[d] ?? 0), 1);
  const maxS       = Math.max(...days.map((d) => storByDay[d]  ?? 0), 1);

  // Mapy
  const planMap    = Object.fromEntries(planCounts.map((p)  => [p.plan,          p._count]));
  const subStatMap = Object.fromEntries(subStatusCounts.map((s) => [s.status,    s._count]));
  const billingMap = Object.fromEntries(billingPeriodCounts.map((b) => [b.billingPeriod, b._count]));
  const maxPlan    = Math.max(...planCounts.map((p) => p._count), 1);
  const maxTheme   = Math.max(...themeCounts.map((t) => t._count), 1);
  const maxMethod  = Math.max(...paymentMethodCounts.map((m) => m._count), 1);
  const totalSubs  = subStatusCounts.reduce((a, s) => a + s._count, 0);
  const activeSubs = subStatMap["ACTIVE"]   ?? 0;
  const cancelSubs = subStatMap["CANCELED"] ?? 0;

  const THEME_LABEL: Record<string, string> = {
    ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
    ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka klasyczna", NATURE: "Przyroda",
  };
  const METHOD_LABEL: Record<string, string> = {
    CARD: "Karta", BLIK: "BLIK", TRANSFER: "Przelew",
    PAYPAL: "PayPal", APPLE_PAY: "Apple Pay", GOOGLE_PAY: "Google Pay", OTHER: "Inne",
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Statystyki i Analityka</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dane na żywo ·{" "}
            {new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* ── 1. Kluczowe KPI ──────────────────────────────────────────── */}
        <SectionTitle>Kluczowe wskaźniki</SectionTitle>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Użytkownicy łącznie" value={totalUsers.toLocaleString("pl-PL")}   sub={`+${usersThisMonth} ten miesiąc`}   accent="blue"   />
          <KpiCard label="Bajki łącznie"        value={totalStories.toLocaleString("pl-PL")} sub={`+${storiesThisMonth} ten miesiąc`} accent="orange" />
          <KpiCard label="Profile dzieci"       value={totalProfiles.toLocaleString("pl-PL")}                                         accent="amber"  />
          <KpiCard label="Przychód łączny"      value={fmtPLN(totalRev)}                     sub={`${fmtPLN(monthRev)} ten miesiąc`}  accent="green"  />
        </div>

        {/* ── 2. Aktywność ─────────────────────────────────────────────── */}
        <SectionTitle>Aktywność użytkowników</SectionTitle>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Nowi dziś"            value={usersToday.toLocaleString("pl-PL")}     accent="blue"   />
          <KpiCard label="Nowi w tym tygodniu"  value={usersThisWeek.toLocaleString("pl-PL")}  accent="blue"   />
          <KpiCard label="Aktywni (30 dni)"     value={activeUsers30d.toLocaleString("pl-PL")} sub={pct(activeUsers30d, totalUsers) + " bazy"} accent="violet" />
          <KpiCard label="Powracający (30 dni)" value={returningUsers.toLocaleString("pl-PL")} sub="zarejestrowani >7 dni temu"               accent="violet" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Bajki dziś"           value={storiesToday.toLocaleString("pl-PL")}    accent="orange" />
          <KpiCard label="Bajki w tym tygodniu" value={storiesThisWeek.toLocaleString("pl-PL")} accent="orange" />
          <KpiCard label="Bajki ten miesiąc"    value={storiesThisMonth.toLocaleString("pl-PL")} accent="orange" />
          <KpiCard label="Aktywni (7 dni)"      value={activeUsers7d.toLocaleString("pl-PL")}   sub={pct(activeUsers7d, totalUsers) + " bazy"} accent="violet" />
        </div>

        {/* ── 3. Konwersje i przychód ──────────────────────────────────── */}
        <SectionTitle>Konwersje i przychód</SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Konwersja → bajka */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejestracja → bajka</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{convStory.toFixed(1).replace(".", ",")}%</span>
              <span className="text-sm text-slate-400 pb-1">{usersWithStories} / {totalUsers}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-orange-400" style={{ width: `${Math.min(convStory, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-400">Użytkownicy, którzy stworzyli ≥1 bajkę</p>
          </div>

          {/* Konwersja → płatność */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejestracja → płatność</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{convPay.toFixed(1).replace(".", ",")}%</span>
              <span className="text-sm text-slate-400 pb-1">{usersWithPayments} / {totalUsers}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(convPay, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-400">Użytkownicy z ≥1 zakończoną płatnością (SUCCEEDED)</p>
          </div>

          {/* ARPU */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Średni przychód na użytkownika</p>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">ARPU — tylko płatni</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums">{fmtPLN(Math.round(arpu))}</p>
              <p className="text-xs text-slate-400 mt-0.5">{totalRevenuePayers} unikalnych płatników</p>
            </div>
            <div className="border-t border-slate-100 pt-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">ARPU — wszyscy użytkownicy</p>
              <p className="text-xl font-bold text-slate-700 tabular-nums">{fmtPLN(Math.round(arpuAll))}</p>
            </div>
          </div>
        </div>

        {/* Wzrost m/m */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Nowi użytkownicy",      cur: usersThisMonth,  prev: usersPrevMonth,  display: usersThisMonth.toString() },
            { label: "Bajki ten miesiąc",      cur: storiesThisMonth, prev: storiesPrevMonth, display: storiesThisMonth.toString() },
            { label: "Przychód ten miesiąc",   cur: monthRev,         prev: prevRev,          display: fmtPLN(monthRev), prevDisplay: fmtPLN(prevRev) },
          ].map(({ label, cur, prev, display, prevDisplay }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{display}</p>
              <p className="text-xs text-slate-400">poprzedni miesiąc: {prevDisplay ?? prev}</p>
              <GrowthBadge p={gPct(cur, prev)} />
            </div>
          ))}
        </div>

        {/* ── 4. Wykresy dzienne ───────────────────────────────────────── */}
        <SectionTitle>Wykresy — ostatnie 30 dni</SectionTitle>

        <div className="grid gap-6 xl:grid-cols-2">
          <DayChart days={days} byDay={usersByDay} maxVal={maxU} color="bg-blue-400"
            label="Nowi użytkownicy (ostatnie 14 dni)" total={recentUsers30d.length} />
          <DayChart days={days} byDay={storByDay}  maxVal={maxS} color="bg-orange-400"
            label="Nowe bajki (ostatnie 14 dni)"       total={recentStories30d.length} />
        </div>

        {/* ── 5. Dystrybucje ──────────────────────────────────────────── */}
        <SectionTitle>Dystrybucje</SectionTitle>

        <div className="grid gap-6 xl:grid-cols-3">

          {/* Tematy bajek */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">Najpopularniejsze tematy bajek</h2>
            {themeCounts.length === 0 ? (
              <p className="text-xs text-slate-400">Brak danych</p>
            ) : (
              <div className="space-y-3">
                {themeCounts.map(({ theme, _count: count }) => (
                  <BarRow key={theme} label={THEME_LABEL[theme] ?? theme} value={count} max={maxTheme} color="bg-orange-300" />
                ))}
              </div>
            )}
          </div>

          {/* Plany subskrypcji */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">Rozkład planów subskrypcji</h2>
            <div className="space-y-3">
              {[
                { key: "FREE",    label: "Free",    color: "bg-slate-400"  },
                { key: "STARTER", label: "Starter", color: "bg-orange-400" },
                { key: "PREMIUM", label: "Premium", color: "bg-violet-500" },
              ].map(({ key, label, color }) => (
                <BarRow key={key}
                  label={`${label} · ${pct(planMap[key] ?? 0, totalSubs > 0 ? totalSubs : 1)}`}
                  value={planMap[key] ?? 0} max={maxPlan} color={color} />
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Aktywne</p>
                <p className="text-lg font-black text-emerald-600">{activeSubs}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Anulowane</p>
                <p className="text-lg font-black text-rose-500">{cancelSubs}</p>
              </div>
            </div>
          </div>

          {/* Metody płatności */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">Metody płatności (SUCCEEDED)</h2>
            {paymentMethodCounts.length === 0 ? (
              <p className="text-xs text-slate-400">Brak zakończonych płatności</p>
            ) : (
              <div className="space-y-3">
                {paymentMethodCounts.map(({ paymentMethod, _count: count }) => (
                  <BarRow key={paymentMethod}
                    label={METHOD_LABEL[paymentMethod] ?? paymentMethod}
                    value={count} max={maxMethod} color="bg-violet-400" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 6. Subskrypcje szczegółowo ──────────────────────────────── */}
        <SectionTitle>Subskrypcje</SectionTitle>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Aktywne subskrypcje"  value={activeSubs.toLocaleString("pl-PL")}        accent="green"  />
          <KpiCard label="Anulowane łącznie"     value={cancelSubs.toLocaleString("pl-PL")}        accent="rose"   />
          <KpiCard label="Anulowane ten miesiąc" value={canceledThisMonth.toLocaleString("pl-PL")} accent="rose"   />
          <KpiCard label="Wskaźnik anulowań"     value={pct(cancelSubs, totalSubs > 0 ? totalSubs : 1)} sub="anulowane / wszystkie" accent="amber" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">Okres rozliczeniowy</h2>
            {[
              { key: "MONTHLY", label: "Miesięczny", color: "bg-blue-400"   },
              { key: "YEARLY",  label: "Roczny",     color: "bg-violet-500" },
            ].map(({ key, label, color }) => {
              const maxB = Math.max(billingMap["MONTHLY"] ?? 0, billingMap["YEARLY"] ?? 0, 1);
              return <BarRow key={key} label={label} value={billingMap[key] ?? 0} max={maxB} color={color} />;
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">Status subskrypcji</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "ACTIVE",     label: "Aktywna",      dot: "bg-emerald-400" },
                { key: "CANCELED",   label: "Anulowana",    dot: "bg-rose-400"    },
                { key: "PAST_DUE",   label: "Zaległa",      dot: "bg-amber-400"   },
                { key: "TRIALING",   label: "Trial",        dot: "bg-blue-400"    },
                { key: "INCOMPLETE", label: "Niekompletna", dot: "bg-slate-400"   },
              ].map(({ key, label, dot }) => {
                const count = subStatMap[key] ?? 0;
                if (count === 0) return null;
                return (
                  <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                      <p className="text-xl font-black text-slate-900 tabular-nums">{count}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 7. Statusy bajek ────────────────────────────────────────── */}
        <SectionTitle>Statusy bajek</SectionTitle>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap gap-4">
            {storyStatusCounts.map(({ status, _count: count }) => (
              <div key={status} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
                <div className={`h-3 w-3 rounded-full ${status === "PUBLISHED" ? "bg-emerald-400" : status === "DRAFT" ? "bg-amber-400" : "bg-slate-400"}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    {status === "PUBLISHED" ? "Opublikowane" : status === "DRAFT" ? "Robocze" : "Archiwum"}
                  </p>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">{count.toLocaleString("pl-PL")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stopka metodologiczna */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500">Metodologia danych</p>
          <p>• <strong>Przychód</strong> — sumowane płatności ze statusem <code className="bg-slate-200 px-1 rounded">SUCCEEDED</code>; wartości w groszach, wyświetlane w PLN.</p>
          <p>• <strong>Aktywni użytkownicy</strong> — pole <code className="bg-slate-200 px-1 rounded">lastActiveAt</code> aktualizowane przy każdej akcji (login, tworzenie bajki itp.).</p>
          <p>• <strong>Powracający</strong> — zarejestrowani ponad 7 dni temu i aktywni w ciągu ostatnich 30 dni.</p>
          <p>• <strong>ARPU (płatni)</strong> — całkowity przychód / liczba unikalnych użytkowników z ≥1 zakończoną płatnością.</p>
          <p>• <strong>Konwersja do płatności</strong> — tylko transakcje ze statusem <code className="bg-slate-200 px-1 rounded">SUCCEEDED</code>.</p>
          <p>• Dane gotowe do integracji ze Stripe — po podłączeniu webhooków uzupełniają się automatycznie.</p>
        </div>

      </div>
    </main>
  );
}
