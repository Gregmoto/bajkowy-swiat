import { prisma } from "@/lib/db";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

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

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: { plan?: string; status?: string };
}) {
  const planFilter   = searchParams.plan   ?? "";
  const statusFilter = searchParams.status ?? "";

  const [subs, planCounts] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        AND: [
          planFilter   ? { plan:   planFilter   as SubscriptionPlan   } : {},
          statusFilter ? { status: statusFilter as SubscriptionStatus } : {},
        ],
      },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.subscription.groupBy({ by: ["plan"], _count: true }),
  ]);

  const planMap   = Object.fromEntries(planCounts.map((p) => [p.plan, p._count]));
  const starterN  = planMap["STARTER"] ?? 0;
  const premiumN  = planMap["PREMIUM"] ?? 0;
  const mrr       = starterN * PLAN_PRICE.STARTER + premiumN * PLAN_PRICE.PREMIUM;
  const totalSubs = subs.length;
  const avgStories = totalSubs > 0 ? Math.round(subs.reduce((a, s) => a + s.storiesThisMonth, 0) / totalSubs) : 0;

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black text-slate-900">Subskrypcje</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totalSubs} wyników</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "MRR (szac.)",    value: `${mrr.toLocaleString("pl-PL")} zł`, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Starter",        value: starterN, color: "bg-orange-50 text-orange-700 border-orange-200" },
            { label: "Premium",        value: premiumN, color: "bg-violet-50 text-violet-700 border-violet-200" },
            { label: "Śr. bajek/mies.",value: avgStories, color: "bg-slate-50 text-slate-700 border-slate-200" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-5 ${color}`}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
              <p className="text-3xl font-black mt-1 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap gap-3">
          <form method="GET" className="flex gap-1.5">
            {(["", "FREE", "STARTER", "PREMIUM"] as const).map((p) => (
              <button key={p} name="plan" value={p} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  planFilter === p
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {p || "Wszystkie plany"}
              </button>
            ))}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          </form>

          <form method="GET" className="flex gap-1.5">
            {(["", "ACTIVE", "PAST_DUE", "CANCELED", "TRIALING"] as const).map((s) => (
              <button key={s} name="status" value={s} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {s || "Wszystkie statusy"}
              </button>
            ))}
            {planFilter && <input type="hidden" name="plan" value={planFilter} />}
          </form>
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
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Bajki/mies.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Odnowienie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Od</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                      Brak wyników.
                    </td>
                  </tr>
                )}
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{s.user.name}</p>
                      <p className="text-xs text-slate-400">{s.user.email}</p>
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
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{s.storiesThisMonth}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                      {s.currentPeriodEnd
                        ? s.currentPeriodEnd.toLocaleDateString("pl-PL")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">
                      {s.createdAt.toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/uzytkownicy/${s.userId}`} className="text-xs text-orange-600 hover:underline font-medium">
                        Profil →
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
