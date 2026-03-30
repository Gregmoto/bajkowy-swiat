export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtPLN(gr: number) {
  return (gr / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN", minimumFractionDigits: 2 });
}
function pct(n: number, d: number) {
  return d === 0 ? "0,0%" : ((n / d) * 100).toFixed(1).replace(".", ",") + "%";
}
function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}
function groupByDay(rows: { createdAt: Date; amount: number }[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of rows) {
    const d = r.createdAt.toISOString().split("T")[0];
    m[d] = (m[d] ?? 0) + r.amount;
  }
  return m;
}
function daysRange(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    days.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

// MRR ceny w groszach (miesięczny ekwiwalent)
const PLAN_MONTHLY_PRICE: Record<string, number> = {
  STARTER_MONTHLY: 1900,
  PREMIUM_MONTHLY: 4900,
  STARTER_YEARLY:  Math.round(19000 / 12),   // 1583
  PREMIUM_YEARLY:  Math.round(49000 / 12),   // 4083
};

// ---------------------------------------------------------------------------
// Komponenty
// ---------------------------------------------------------------------------
function KpiCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string;
  accent?: "blue" | "green" | "orange" | "violet" | "rose" | "amber";
}) {
  const dot: Record<string, string> = {
    blue: "bg-blue-400", green: "bg-emerald-400", orange: "bg-orange-400",
    violet: "bg-violet-500", rose: "bg-rose-400", amber: "bg-amber-400",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
      <div className="flex items-center gap-2">
        {accent && <span className={`h-2 w-2 rounded-full shrink-0 ${dot[accent]}`} />}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none">{label}</p>
      </div>
      <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max, color, suffix = "" }: {
  label: string; value: number; max: number; color: string; suffix?: string;
}) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <div className="space-y-1 min-w-0">
        <span className="text-xs text-slate-600 truncate block">{label}</span>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${w}%` }} />
        </div>
      </div>
      <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums whitespace-nowrap">
        {suffix}{value.toLocaleString("pl-PL")}
      </span>
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

function GrowthBadge({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0) return null;
  const n = Math.round(((cur - prev) / prev) * 100);
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${n >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
      {n >= 0 ? "+" : ""}{n}% m/m
    </span>
  );
}

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminFinansePage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; method?: string; currency?: string };
}) {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Zakres dat z filtra
  const fromDate = searchParams.from
    ? new Date(searchParams.from + "T00:00:00.000Z")
    : new Date(now.getFullYear(), now.getMonth() - 5, 1); // domyślnie: 6 miesięcy wstecz
  const toDate = searchParams.to
    ? new Date(searchParams.to + "T23:59:59.999Z")
    : new Date(now.getTime() + 86400000);

  const methodFilter   = (searchParams.method   ?? "") as PaymentMethod | "";
  const currencyFilter = (searchParams.currency ?? "").toUpperCase();

  // Bazowy filtr dla wykresów (zakres dat + metoda + waluta)
  const rangeFilter = {
    status:    PaymentStatus.SUCCEEDED,
    createdAt: { gte: fromDate, lte: toDate },
    ...(methodFilter   ? { paymentMethod: methodFilter }       : {}),
    ...(currencyFilter ? { currency: currencyFilter }           : {}),
  };

  // Stałe okresy — nie zależą od filtra dat
  const sevenDaysAgo   = new Date(now.getTime() - 7  * 86400000);
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 86400000);
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const methodBase = methodFilter   ? { paymentMethod: methodFilter }  : {};
  const currBase   = currencyFilter ? { currency: currencyFilter }     : {};

  const [
    // Przychód w wybranym zakresie
    revenueRange,
    transactionCount,

    // Stałe KPI (nie filtrowane zakresem dat)
    revenueTotal,
    revenueToday,
    revenue7d,
    revenue30d,
    revenuePrevMonth,
    revenueThisMonth,

    // Liczby transakcji
    txToday,
    tx7d,
    tx30d,
    txTotal,

    // Refundy
    refundCount,
    refundAmount,

    // Wykresy: przychód po dniach w zakresie
    revenueByDay,

    // Dystrybucja po metodzie płatności
    byMethod,

    // Dystrybucja po walucie
    byCurrency,

    // Nieudane płatności (ostatnie 20)
    failedPayments,

    // MRR: aktywne subskrypcje z planem i billingPeriod
    activeSubs,
    canceledThisMonth,
    totalSubs,
  ] = await Promise.all([
    // Zakres filtra
    prisma.payment.aggregate({ _sum: { amount: true }, where: rangeFilter }),
    prisma.payment.count({ where: rangeFilter }),

    // Stałe KPI
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", ...methodBase, ...currBase } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", createdAt: { gte: today }, ...methodBase, ...currBase } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", createdAt: { gte: sevenDaysAgo  }, ...methodBase, ...currBase } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", createdAt: { gte: thirtyDaysAgo }, ...methodBase, ...currBase } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", createdAt: { gte: prevMonthStart, lte: prevMonthEnd }, ...methodBase, ...currBase } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED", createdAt: { gte: startOfMonth  }, ...methodBase, ...currBase } }),

    // Liczniki
    prisma.payment.count({ where: { status: "SUCCEEDED", createdAt: { gte: today          }, ...methodBase, ...currBase } }),
    prisma.payment.count({ where: { status: "SUCCEEDED", createdAt: { gte: sevenDaysAgo   }, ...methodBase, ...currBase } }),
    prisma.payment.count({ where: { status: "SUCCEEDED", createdAt: { gte: thirtyDaysAgo  }, ...methodBase, ...currBase } }),
    prisma.payment.count({ where: { status: "SUCCEEDED", ...methodBase, ...currBase } }),

    // Refundy
    prisma.payment.count({ where: { status: "REFUNDED", ...methodBase, ...currBase } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "REFUNDED", ...methodBase, ...currBase } }),

    // Przychód po dniach w zakresie
    prisma.payment.findMany({
      where: rangeFilter,
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: "asc" },
    }),

    // Po metodzie
    prisma.payment.groupBy({
      by: ["paymentMethod"], _sum: { amount: true }, _count: true,
      where: { status: "SUCCEEDED", ...currBase },
      orderBy: { _sum: { amount: "desc" } },
    }),

    // Po walucie
    prisma.payment.groupBy({
      by: ["currency"], _sum: { amount: true }, _count: true,
      where: { status: "SUCCEEDED", ...methodBase },
      orderBy: { _sum: { amount: "desc" } },
    }),

    // Nieudane
    prisma.payment.findMany({
      where: { status: "FAILED", ...methodBase, ...currBase },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),

    // Subskrypcje do MRR
    prisma.subscription.findMany({
      where: { status: "ACTIVE", plan: { not: "FREE" } },
      select: { plan: true, billingPeriod: true },
    }),
    prisma.subscription.count({ where: { status: "CANCELED", canceledAt: { gte: startOfMonth } } }),
    prisma.subscription.count({ where: { plan: { not: "FREE" } } }),
  ]);

  // ---------------------------------------------------------------------------
  // Obliczone metryki
  // ---------------------------------------------------------------------------
  const totalRev   = revenueTotal._sum.amount     ?? 0;
  const todayRev   = revenueToday._sum.amount     ?? 0;
  const rev7d      = revenue7d._sum.amount        ?? 0;
  const rev30d     = revenue30d._sum.amount       ?? 0;
  const prevRev    = revenuePrevMonth._sum.amount ?? 0;
  const monthRev   = revenueThisMonth._sum.amount ?? 0;
  const rangeRev   = revenueRange._sum.amount     ?? 0;
  const refundAmt  = refundAmount._sum.amount     ?? 0;
  const aov        = txTotal > 0 ? Math.round(totalRev / txTotal) : 0;
  const aovRange   = transactionCount > 0 ? Math.round(rangeRev / transactionCount) : 0;

  // MRR
  let mrr = 0;
  for (const sub of activeSubs) {
    const key = `${sub.plan}_${sub.billingPeriod}`;
    mrr += PLAN_MONTHLY_PRICE[key] ?? 0;
  }
  const arr = mrr * 12;

  // Churn
  const churnRate = totalSubs > 0 ? (canceledThisMonth / totalSubs) * 100 : 0;

  // Wykres dzienny
  const chartDays   = daysRange(fromDate, toDate).slice(-60); // maks 60 słupków
  const revByDay    = groupByDay(revenueByDay);
  const maxDayRev   = Math.max(...chartDays.map((d) => revByDay[d] ?? 0), 1);

  // Dystrybucja
  const maxMethod   = Math.max(...byMethod.map((m) => m._sum.amount ?? 0), 1);
  const maxCurrency = Math.max(...byCurrency.map((c) => c._sum.amount ?? 0), 1);

  const METHOD_LABEL: Record<string, string> = {
    CARD: "Karta", BLIK: "BLIK", TRANSFER: "Przelew",
    PAYPAL: "PayPal", APPLE_PAY: "Apple Pay", GOOGLE_PAY: "Google Pay", OTHER: "Inne",
  };

  // Plan distribution for MRR table
  const planMrr: Record<string, { count: number; mrr: number }> = {};
  for (const sub of activeSubs) {
    const key  = sub.plan;
    const mKey = `${sub.plan}_${sub.billingPeriod}`;
    if (!planMrr[key]) planMrr[key] = { count: 0, mrr: 0 };
    planMrr[key].count += 1;
    planMrr[key].mrr   += PLAN_MONTHLY_PRICE[mKey] ?? 0;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Finanse</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Widok przychodów i rozliczeń dla właściciela platformy ·{" "}
            {new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* ── Filtry ─────────────────────────────────────────────────────── */}
        <form method="GET" className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Od</label>
              <input type="date" name="from"
                defaultValue={searchParams.from ?? fromDate.toISOString().split("T")[0]}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Do</label>
              <input type="date" name="to"
                defaultValue={searchParams.to ?? new Date().toISOString().split("T")[0]}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metoda płatności</label>
              <select name="method" defaultValue={methodFilter}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Wszystkie metody</option>
                {(["CARD","BLIK","TRANSFER","PAYPAL","APPLE_PAY","GOOGLE_PAY","OTHER"] as PaymentMethod[]).map((m) => (
                  <option key={m} value={m}>{METHOD_LABEL[m]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Waluta</label>
              <select name="currency" defaultValue={currencyFilter}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Wszystkie waluty</option>
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <button type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
              Zastosuj
            </button>
            {(searchParams.from || searchParams.to || methodFilter || currencyFilter) && (
              <a href="/admin/finanse"
                className="px-5 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Wyczyść
              </a>
            )}
            <div className="ml-auto text-xs text-slate-400 self-center">
              Wybrany zakres: <strong className="text-slate-600">
                {fromDate.toLocaleDateString("pl-PL")} – {new Date(toDate.getTime() - 1).toLocaleDateString("pl-PL")}
              </strong>
              {" · "}{transactionCount} transakcji · łącznie {fmtPLN(rangeRev)}
            </div>
          </div>
        </form>

        {/* ── 1. Stałe KPI ───────────────────────────────────────────────── */}
        <SectionTitle>Kluczowe wskaźniki przychodów</SectionTitle>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Przychód łączny"       value={fmtPLN(totalRev)}   sub={`${txTotal} transakcji`}                accent="green"  />
          <KpiCard label="Przychód dziś"          value={fmtPLN(todayRev)}   sub={`${txToday} transakcji`}                accent="green"  />
          <KpiCard label="Przychód (7 dni)"       value={fmtPLN(rev7d)}      sub={`${tx7d} transakcji`}                   accent="blue"   />
          <KpiCard label="Przychód (30 dni)"      value={fmtPLN(rev30d)}     sub={`${tx30d} transakcji`}                  accent="blue"   />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Śr. wartość transakcji" value={fmtPLN(aov)}        sub="wszystkie płatności (SUCCEEDED)"        accent="orange" />
          <KpiCard label="Liczba refundacji"       value={refundCount.toLocaleString("pl-PL")} sub={fmtPLN(refundAmt) + " zwrócono"} accent="rose"   />
          <KpiCard label="MRR"                     value={fmtPLN(mrr)}        sub={`ARR: ${fmtPLN(arr)}`}                  accent="violet" />
          <KpiCard label="Churn (ten miesiąc)"
            value={churnRate.toFixed(1).replace(".", ",") + "%"}
            sub={`${canceledThisMonth} anulowań / ${totalSubs} płatnych subsk.`}
            accent="amber" />
        </div>

        {/* Wzrost m/m */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Przychód ten miesiąc", cur: monthRev, prev: prevRev, display: fmtPLN(monthRev), prevDisplay: fmtPLN(prevRev) },
            { label: "Środnia transakcja",   cur: aovRange, prev: aov,     display: fmtPLN(aovRange), prevDisplay: fmtPLN(aov)    },
            { label: "Refundacje / przychód", cur: refundAmt, prev: totalRev, display: pct(refundAmt, totalRev), sub: true },
          ].map(({ label, cur, prev, display, prevDisplay, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{display}</p>
              {!sub && <p className="text-xs text-slate-400">poprzedni miesiąc: {prevDisplay}</p>}
              {!sub && <GrowthBadge cur={cur} prev={prev} />}
              {sub && <p className="text-xs text-slate-400">wskaźnik zwrotów</p>}
            </div>
          ))}
        </div>

        {/* ── 2. Wykres dzienny ───────────────────────────────────────────── */}
        <SectionTitle>Przychód dzienny — wybrany zakres</SectionTitle>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-black text-slate-700">Przychód per dzień (PLN)</h2>
            <span className="text-xs text-slate-400">{chartDays.length} dni · maks. {fmtPLN(maxDayRev)}/dzień</span>
          </div>

          {chartDays.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">Brak danych w wybranym zakresie.</p>
          ) : (
            <>
              <div className="flex items-end gap-px h-32 overflow-x-auto">
                {chartDays.map((day) => {
                  const rev  = revByDay[day] ?? 0;
                  const h    = maxDayRev > 0 ? Math.max(2, Math.round((rev / maxDayRev) * 100)) : 2;
                  const hasRev = rev > 0;
                  return (
                    <div key={day} className="flex-1 min-w-[6px] relative group flex flex-col justify-end">
                      {hasRev && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 pointer-events-none">
                          {formatDay(day)}: {fmtPLN(rev)}
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t transition-all ${hasRev ? "bg-emerald-400 hover:bg-emerald-500" : "bg-slate-100"}`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-400">{formatDay(chartDays[0])}</span>
                <span className="text-[10px] text-slate-400">{formatDay(chartDays[chartDays.length - 1])}</span>
              </div>
            </>
          )}
        </div>

        {/* ── 3. Dystrybucje ──────────────────────────────────────────────── */}
        <SectionTitle>Dystrybucja przychodów</SectionTitle>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Po metodzie płatności */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">Metody płatności</h2>
            {byMethod.length === 0 ? (
              <p className="text-xs text-slate-400">Brak danych</p>
            ) : (
              <div className="space-y-3">
                {byMethod.map((m) => (
                  <div key={m.paymentMethod} className="space-y-1">
                    <BarRow
                      label={`${METHOD_LABEL[m.paymentMethod] ?? m.paymentMethod} (${m._count}x)`}
                      value={m._sum.amount ?? 0}
                      max={maxMethod}
                      color="bg-blue-400"
                    />
                    <p className="text-[10px] text-slate-400 text-right">{fmtPLN(m._sum.amount ?? 0)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Po walucie */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">Waluty</h2>
            {byCurrency.length === 0 ? (
              <p className="text-xs text-slate-400">Brak danych</p>
            ) : (
              <div className="space-y-3">
                {byCurrency.map((c) => (
                  <div key={c.currency} className="space-y-1">
                    <BarRow
                      label={`${c.currency} (${c._count} transakcji)`}
                      value={c._sum.amount ?? 0}
                      max={maxCurrency}
                      color="bg-violet-400"
                    />
                    <p className="text-[10px] text-slate-400 text-right">
                      {((c._sum.amount ?? 0) / 100).toFixed(2)} {c.currency}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MRR po planach */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-700">MRR według planu</h2>
            {Object.keys(planMrr).length === 0 ? (
              <p className="text-xs text-slate-400">Brak aktywnych płatnych subskrypcji</p>
            ) : (
              <>
                <div className="space-y-3">
                  {Object.entries(planMrr)
                    .sort(([, a], [, b]) => b.mrr - a.mrr)
                    .map(([plan, data]) => {
                      const maxPlanMrr = Math.max(...Object.values(planMrr).map((v) => v.mrr), 1);
                      return (
                        <div key={plan} className="space-y-1">
                          <BarRow
                            label={`${plan} (${data.count} subsk.)`}
                            value={data.mrr}
                            max={maxPlanMrr}
                            color={plan === "PREMIUM" ? "bg-violet-500" : "bg-orange-400"}
                          />
                          <p className="text-[10px] text-slate-400 text-right">{fmtPLN(data.mrr)}/mies.</p>
                        </div>
                      );
                    })}
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">MRR łącznie</span>
                  <span className="font-black text-slate-900 tabular-nums">{fmtPLN(mrr)}</span>
                </div>
              </>
            )}
          </div>

        </div>

        {/* ── 4. Top transakcje (wybrany zakres) ─────────────────────────── */}
        <SectionTitle>Nieudane płatności (ostatnie 15)</SectionTitle>

        {failedPayments.length === 0 ? (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center">
            <p className="text-sm font-semibold text-emerald-700">✓ Brak nieudanych płatności</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Użytkownik</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Opis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Metoda</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Kwota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {failedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs font-mono text-slate-600">{p.createdAt.toLocaleDateString("pl-PL")}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {p.user ? (
                          <div>
                            <p className="text-xs font-medium text-slate-800">{p.user.name}</p>
                            <p className="text-[10px] text-slate-400">{p.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 max-w-[200px] truncate">{p.description ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-black text-rose-600 tabular-nums">{fmtPLN(p.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Stopka ─────────────────────────────────────────────────────── */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500">Metodologia</p>
          <p>• <strong>MRR</strong> — miesięczny przychód cykliczny: STARTER×19zł + PREMIUM×49zł (miesięczne) + STARTER×~15,83zł + PREMIUM×~40,83zł (roczne, podzielone przez 12).</p>
          <p>• <strong>ARR</strong> — MRR × 12.</p>
          <p>• <strong>Churn</strong> — anulowania w bieżącym miesiącu / łączna liczba płatnych subskrypcji.</p>
          <p>• <strong>AOV</strong> (średnia wartość transakcji) — łączny przychód SUCCEEDED / liczba transakcji SUCCEEDED.</p>
          <p>• Filtry (zakres dat, metoda, waluta) stosowane do wykresów i tabelek. KPI z lewej kolumny zawsze pokazują dane całościowe.</p>
        </div>

      </div>
    </main>
  );
}
