import { prisma } from "@/lib/db";
import { SubscriptionPlan } from "@prisma/client";
import { Search, UserX, ShieldCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PLAN_STYLE: Record<string, string> = {
  FREE:    "bg-slate-100 text-slate-600",
  STARTER: "bg-orange-100 text-orange-700",
  PREMIUM: "bg-violet-100 text-violet-700",
};

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; plan?: string; banned?: string };
}) {
  const q    = searchParams.q     ?? "";
  const plan = searchParams.plan  ?? "";
  const showBanned = searchParams.banned === "1";

  const users = await prisma.user.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { email: { contains: q, mode: "insensitive" } },
                { name:  { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        plan ? { subscription: { plan: plan as SubscriptionPlan } } : {},
        showBanned ? { isBanned: true } : {},
      ],
    },
    include: {
      subscription: { select: { plan: true, status: true } },
      _count: { select: { stories: true, profiles: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalBanned = await prisma.user.count({ where: { isBanned: true } });

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Użytkownicy</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {users.length} wyników
              {totalBanned > 0 && ` · ${totalBanned} zablokowanych`}
            </p>
          </div>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Wyszukiwarka */}
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Szukaj po emailu lub imieniu…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-72 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {plan && <input type="hidden" name="plan" value={plan} />}
            {showBanned && <input type="hidden" name="banned" value="1" />}
          </form>

          {/* Plan */}
          <form method="GET" className="flex gap-1.5">
            {["", "FREE", "STARTER", "PREMIUM"].map((p) => (
              <button
                key={p}
                name="plan"
                value={p}
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  plan === p
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {p || "Wszystkie"}
              </button>
            ))}
            {q && <input type="hidden" name="q" value={q} />}
          </form>

          {/* Zbanowani */}
          <a
            href={showBanned ? "/admin/uzytkownicy" : "/admin/uzytkownicy?banned=1"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showBanned
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <UserX className="h-3.5 w-3.5" />
            Zablokowane
          </a>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Użytkownik</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rola</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Bajki</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Dzieci</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data rej.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                      Brak wyników dla podanych kryteriów.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_STYLE[u.subscription?.plan ?? "FREE"]}`}>
                        {u.subscription?.plan ?? "FREE"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "ADMIN" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-orange-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">USER</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm">{u._count.stories}</td>
                    <td className="px-4 py-3 text-center font-mono text-sm">{u._count.profiles}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                      {u.createdAt.toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Zablokowany
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600">
                          Aktywny
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/uzytkownicy/${u.id}`}
                        className="text-xs text-orange-600 hover:underline font-medium"
                      >
                        Szczegóły →
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
