import { prisma } from "@/lib/db";
import { SubscriptionPlan, UserRole } from "@prisma/client";
import { Search, UserX, ShieldCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PLAN_STYLE: Record<string, string> = {
  FREE:    "bg-slate-100 text-slate-600",
  STARTER: "bg-orange-100 text-orange-700",
  PREMIUM: "bg-violet-100 text-violet-700",
};

type SortField = "createdAt" | "name" | "stories" | "payments";
type SortDir   = "asc" | "desc";

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: {
    q?: string; plan?: string; role?: string;
    banned?: string; sort?: string; dir?: string;
  };
}) {
  const q          = searchParams.q      ?? "";
  const plan       = searchParams.plan   ?? "";
  const role       = searchParams.role   ?? "";
  const showBanned = searchParams.banned === "1";
  const sort       = (searchParams.sort  ?? "createdAt") as SortField;
  const dir        = (searchParams.dir   ?? "desc")      as SortDir;

  const dbSort = sort === "createdAt" || sort === "name"
    ? { [sort]: dir }
    : { createdAt: "desc" as const };

  const users = await prisma.user.findMany({
    where: {
      AND: [
        q ? { OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name:  { contains: q, mode: "insensitive" } },
        ]} : {},
        plan       ? { subscription: { plan: plan as SubscriptionPlan } } : {},
        role       ? { role: role as UserRole } : {},
        showBanned ? { isBanned: true } : {},
      ],
    },
    include: {
      subscription: { select: { plan: true, status: true } },
      _count: { select: { stories: true, profiles: true, payments: true } },
    },
    orderBy: dbSort,
    take: 200,
  });

  // Sortowanie w JS dla pól relacyjnych
  const sorted = sort === "stories"
    ? [...users].sort((a, b) => dir === "desc"
        ? b._count.stories - a._count.stories
        : a._count.stories - b._count.stories)
    : sort === "payments"
    ? [...users].sort((a, b) => dir === "desc"
        ? b._count.payments - a._count.payments
        : a._count.payments - b._count.payments)
    : users;

  const [totalBanned, totalAdmins] = await Promise.all([
    prisma.user.count({ where: { isBanned: true } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  function sortUrl(field: SortField) {
    const newDir = sort === field && dir === "desc" ? "asc" : "desc";
    const params = new URLSearchParams();
    if (q)          params.set("q", q);
    if (plan)       params.set("plan", plan);
    if (role)       params.set("role", role);
    if (showBanned) params.set("banned", "1");
    params.set("sort", field);
    params.set("dir", newDir);
    return `/admin/uzytkownicy?${params.toString()}`;
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sort !== field) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-orange-500 ml-1">{dir === "desc" ? "↓" : "↑"}</span>;
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Użytkownicy</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {sorted.length} wyników
            {totalBanned > 0 && ` · ${totalBanned} zablokowanych`}
            {totalAdmins > 0 && ` · ${totalAdmins} adminów`}
          </p>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Wyszukiwarka */}
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input name="q" defaultValue={q} placeholder="Szukaj po emailu lub imieniu…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-72 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            {plan       && <input type="hidden" name="plan"   value={plan} />}
            {role       && <input type="hidden" name="role"   value={role} />}
            {showBanned && <input type="hidden" name="banned" value="1" />}
          </form>

          {/* Filtr planu */}
          <form method="GET" className="flex gap-1.5 flex-wrap">
            {(["", "FREE", "STARTER", "PREMIUM"] as const).map((p) => (
              <button key={p} name="plan" value={p} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  plan === p ? "bg-orange-500 text-white border-orange-500"
                             : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {p || "Wszystkie plany"}
              </button>
            ))}
            {q          && <input type="hidden" name="q"      value={q} />}
            {role       && <input type="hidden" name="role"   value={role} />}
            {showBanned && <input type="hidden" name="banned" value="1" />}
          </form>

          {/* Filtr roli */}
          <form method="GET" className="flex gap-1.5">
            {(["", "USER", "ADMIN"] as const).map((r) => (
              <button key={r} name="role" value={r} type="submit"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  role === r ? "bg-orange-500 text-white border-orange-500"
                             : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {r === "ADMIN" && <ShieldCheck className="h-3 w-3" />}
                {r || "Wszystkie role"}
              </button>
            ))}
            {q          && <input type="hidden" name="q"    value={q} />}
            {plan       && <input type="hidden" name="plan" value={plan} />}
            {showBanned && <input type="hidden" name="banned" value="1" />}
          </form>

          {/* Filtr zablokowanych */}
          <a href={showBanned ? "/admin/uzytkownicy" : "/admin/uzytkownicy?banned=1"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showBanned ? "bg-red-500 text-white border-red-500"
                         : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <a href={sortUrl("name")} className="hover:text-slate-800 inline-flex items-center gap-1">
                      Użytkownik <SortIcon field="name" />
                    </a>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rola</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <a href={sortUrl("stories")} className="hover:text-slate-800 inline-flex items-center gap-1">
                      Bajki <SortIcon field="stories" />
                    </a>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <a href={sortUrl("payments")} className="hover:text-slate-800 inline-flex items-center gap-1">
                      Płatności <SortIcon field="payments" />
                    </a>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <a href={sortUrl("createdAt")} className="hover:text-slate-800 inline-flex items-center gap-1">
                      Data rej. <SortIcon field="createdAt" />
                    </a>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">
                      Brak wyników dla podanych kryteriów.
                    </td>
                  </tr>
                )}
                {sorted.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-400 select-all" title={u.id}>
                        {u.id.slice(0, 8)}…
                      </span>
                    </td>
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
                          <ShieldCheck className="h-3.5 w-3.5" />ADMIN
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">USER</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm">{u._count.stories}</td>
                    <td className="px-4 py-3 text-center font-mono text-sm">{u._count.payments}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                      {u.createdAt.toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Zablokowany</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600">Aktywny</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/uzytkownicy/${u.id}`} className="text-xs text-orange-600 hover:underline font-medium">
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
