import { prisma } from "@/lib/db";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { Search } from "lucide-react";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { cancelSubscription, restoreSubscription, changeBillingPeriod } from "@/lib/actions/admin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PLAN_STYLE: Record<string, string> = {
  FREE:    "bg-slate-100 text-slate-600",
  STARTER: "bg-orange-100 text-orange-700",
  PREMIUM: "bg-violet-100 text-violet-700",
};
const STATUS_STYLE: Record<string, string> = {
  ACTIVE:     "bg-emerald-100 text-emerald-700",
  PAST_DUE:   "bg-red-100 text-red-700",
  CANCELED:   "bg-slate-100 text-slate-500",
  TRIALING:   "bg-blue-100 text-blue-700",
  INCOMPLETE: "bg-amber-100 text-amber-700",
};
const PLAN_PRICE: Record<string, number> = { FREE: 0, STARTER: 19, PREMIUM: 49 };

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: { q?: string; plan?: string; status?: string; period?: string };
}) {
  const q            = searchParams.q      ?? "";
  const planFilter   = searchParams.plan   ?? "";
  const statusFilter = searchParams.status ?? "";
  const periodFilter = searchParams.period ?? "";

  const [subs, planCounts, statusCounts] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        AND: [
          planFilter   ? { plan:          planFilter   as SubscriptionPlan   } : {},
          statusFilter ? { status:        statusFilter as SubscriptionStatus } : {},
          periodFilter ? { billingPeriod: periodFilter as "MONTHLY" | "YEARLY" } : {},
          q ? { user: { OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name:  { contains: q, mode: "insensitive" } },
          ]}} : {},
        ],
      },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.subscription.groupBy({ by: ["plan"],   _count: true }),
    prisma.subscription.groupBy({ by: ["status"], _count: true }),
  ]);

  const planMap   = Object.fromEntries(planCounts.map((p) => [p.plan, p._count]));
  const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));

  const starterN = planMap["STARTER"] ?? 0;
  const premiumN = planMap["PREMIUM"] ?? 0;
  const mrr      = starterN * PLAN_PRICE.STARTER + premiumN * PLAN_PRICE.PREMIUM;

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Subskrypcje</h1>
          <p className="text-sm text-slate-500 mt-0.5">{subs.length} wyników</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {[
            { label: "MRR (szac.)",   value: `${mrr} zł`,          color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Starter",       value: starterN,              color: "bg-orange-50 text-orange-700 border-orange-200" },
            { label: "Premium",       value: premiumN,              color: "bg-violet-50 text-violet-700 border-violet-200" },
            { label: "Aktywne",       value: statusMap["ACTIVE"]   ?? 0, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Anulowane",     value: statusMap["CANCELED"] ?? 0, color: "bg-slate-50 text-slate-600 border-slate-200" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
              <p className="text-2xl font-black mt-1 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap gap-3">

          {/* Szukaj */}
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input name="q" defaultValue={q} placeholder="Szukaj po emailu lub imieniu…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-72 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            {planFilter   && <input type="hidden" name="plan"   value={planFilter} />}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {periodFilter && <input type="hidden" name="period" value={periodFilter} />}
          </form>

          {/* Plan */}
          <form method="GET" className="flex gap-1.5 flex-wrap">
            {(["", "FREE", "STARTER", "PREMIUM"] as const).map((p) => (
              <button key={p} name="plan" value={p} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  planFilter === p ? "bg-orange-500 text-white border-orange-500"
                                   : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {p || "Wszystkie plany"}
              </button>
            ))}
            {q            && <input type="hidden" name="q"      value={q} />}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            {periodFilter && <input type="hidden" name="period" value={periodFilter} />}
          </form>

          {/* Status */}
          <form method="GET" className="flex gap-1.5 flex-wrap">
            {(["", "ACTIVE", "PAST_DUE", "CANCELED", "TRIALING"] as const).map((s) => (
              <button key={s} name="status" value={s} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s ? "bg-orange-500 text-white border-orange-500"
                                     : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {s || "Wszystkie statusy"}
              </button>
            ))}
            {q          && <input type="hidden" name="q"    value={q} />}
            {planFilter && <input type="hidden" name="plan" value={planFilter} />}
            {periodFilter && <input type="hidden" name="period" value={periodFilter} />}
          </form>

          {/* Okres rozliczeniowy */}
          <form method="GET" className="flex gap-1.5">
            {(["", "MONTHLY", "YEARLY"] as const).map((p) => (
              <button key={p} name="period" value={p} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  periodFilter === p ? "bg-orange-500 text-white border-orange-500"
                                     : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {p === "MONTHLY" ? "Miesięczny" : p === "YEARLY" ? "Roczny" : "Wszystkie okresy"}
              </button>
            ))}
            {q            && <input type="hidden" name="q"      value={q} />}
            {planFilter   && <input type="hidden" name="plan"   value={planFilter} />}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          </form>

          {(q || planFilter || statusFilter || periodFilter) && (
            <a href="/admin/subskrypcje"
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-500 hover:text-slate-700 transition-colors">
              ✕ Wyczyść
            </a>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Użytkownik</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Okres</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rozpoczęcie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Odnowienie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Anulowanie</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Bajki</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">
                      Brak wyników.
                    </td>
                  </tr>
                )}
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <a href={`/admin/uzytkownicy/${s.user.id}`} className="hover:underline">
                        <p className="font-semibold text-slate-800">{s.user.name}</p>
                        <p className="text-xs text-slate-400">{s.user.email}</p>
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_STYLE[s.plan]}`}>
                        {s.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[s.status]}`}>
                        {s.status}
                      </span>
                      {s.cancelAtPeriodEnd && s.status !== "CANCELED" && (
                        <p className="text-[10px] text-amber-600 mt-0.5">Anuluje na koniec okresu</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {s.billingPeriod === "YEARLY" ? "Roczny" : "Miesięczny"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                      {s.currentPeriodStart ? s.currentPeriodStart.toLocaleDateString("pl-PL") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                      {s.currentPeriodEnd ? s.currentPeriodEnd.toLocaleDateString("pl-PL") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums">
                      {s.canceledAt
                        ? <span className="text-red-500">{s.canceledAt.toLocaleDateString("pl-PL")}</span>
                        : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm">{s.storiesThisMonth}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {s.status !== "CANCELED" ? (
                          <AdminActionButton
                            label="Anuluj"
                            confirmMessage={`Anulować subskrypcję użytkownika ${s.user.email}?`}
                            action={() => cancelSubscription(s.userId)}
                            variant="warning"
                          />
                        ) : (
                          <AdminActionButton
                            label="Przywróć"
                            confirmMessage={`Przywrócić subskrypcję użytkownika ${s.user.email}?`}
                            action={() => restoreSubscription(s.userId)}
                            variant="success"
                          />
                        )}
                        {s.billingPeriod === "MONTHLY" ? (
                          <AdminActionButton
                            label="→ Roczny"
                            action={() => changeBillingPeriod(s.userId, "YEARLY")}
                            variant="default"
                          />
                        ) : (
                          <AdminActionButton
                            label="→ Miesięczny"
                            action={() => changeBillingPeriod(s.userId, "MONTHLY")}
                            variant="default"
                          />
                        )}
                      </div>
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
