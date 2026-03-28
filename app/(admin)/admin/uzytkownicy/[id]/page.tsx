import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SubscriptionPlan, UserRole } from "@prisma/client";
import { ShieldCheck, BookOpen, Baby, ArrowLeft } from "lucide-react";
import AdminActionButton from "@/components/admin/AdminActionButton";
import {
  toggleBanUser,
  changeUserPlan,
  changeUserRole,
  deleteUser,
} from "@/lib/actions/admin";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PLAN_STYLE: Record<string, string> = {
  FREE:    "bg-slate-100 text-slate-600",
  STARTER: "bg-orange-100 text-orange-700",
  PREMIUM: "bg-violet-100 text-violet-700",
};
const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka", NATURE: "Przyroda",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{children}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subscription: true,
      profiles: {
        include: { _count: { select: { stories: true } } },
        orderBy: { createdAt: "asc" },
      },
      stories: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { childProfile: { select: { name: true } } },
      },
      _count: { select: { stories: true, profiles: true, auditLogs: true } },
    },
  });

  if (!user) notFound();

  const GENDER_LABEL: Record<string, string> = { BOY: "Chłopiec", GIRL: "Dziewczynka", OTHER: "Inne" };

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Powrót */}
        <a href="/admin/uzytkownicy" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Wróć do listy użytkowników
        </a>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              {user.role === "ADMIN" && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ADMIN
                </span>
              )}
              {user.isBanned && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                  ZABLOKOWANY
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
          </div>

          {/* Akcje */}
          <div className="flex flex-wrap gap-2">
            <AdminActionButton
              label={user.isBanned ? "Odblokuj" : "Zablokuj"}
              confirmMessage={user.isBanned
                ? `Odblokować konto ${user.email}?`
                : `Zablokować konto ${user.email}? Użytkownik nie będzie mógł się zalogować.`
              }
              action={() => toggleBanUser(user.id)}
              variant={user.isBanned ? "success" : "warning"}
            />
            <AdminActionButton
              label={user.role === "ADMIN" ? "Odbierz rolę ADMIN" : "Nadaj rolę ADMIN"}
              confirmMessage={`Zmienić rolę użytkownika ${user.email}?`}
              action={() => changeUserRole(user.id, user.role === "ADMIN" ? UserRole.USER : UserRole.ADMIN)}
              variant="default"
            />
            <AdminActionButton
              label="Usuń konto"
              confirmMessage={`UWAGA: Trwale usunąć konto ${user.email} wraz ze wszystkimi danymi?`}
              action={() => deleteUser(user.id)}
              variant="danger"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Dane konta */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Dane konta</h2>
            <InfoRow label="ID">{user.id.slice(0, 12)}…</InfoRow>
            <InfoRow label="Email">{user.email}</InfoRow>
            <InfoRow label="Rola">{user.role}</InfoRow>
            <InfoRow label="Zarejestrowany">{user.createdAt.toLocaleDateString("pl-PL")}</InfoRow>
            <InfoRow label="Bajki">{user._count.stories}</InfoRow>
            <InfoRow label="Profile dzieci">{user._count.profiles}</InfoRow>
            <InfoRow label="Logi aktywności">{user._count.auditLogs}</InfoRow>
          </div>

          {/* Subskrypcja */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Subskrypcja</h2>
            {user.subscription ? (
              <>
                <InfoRow label="Plan">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_STYLE[user.subscription.plan]}`}>
                    {user.subscription.plan}
                  </span>
                </InfoRow>
                <InfoRow label="Status">{user.subscription.status}</InfoRow>
                <InfoRow label="Bajki w mies.">{user.subscription.storiesThisMonth}</InfoRow>
                {user.subscription.currentPeriodEnd && (
                  <InfoRow label="Koniec okresu">
                    {user.subscription.currentPeriodEnd.toLocaleDateString("pl-PL")}
                  </InfoRow>
                )}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Zmień plan:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["FREE", "STARTER", "PREMIUM"] as SubscriptionPlan[]).map((p) => (
                      <AdminActionButton
                        key={p}
                        label={p}
                        action={() => changeUserPlan(user.id, p)}
                        variant={user.subscription?.plan === p ? "success" : "default"}
                        className={user.subscription?.plan === p ? "ring-2 ring-emerald-300" : ""}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Brak subskrypcji</p>
            )}
          </div>

          {/* Profile dzieci */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">
              <span className="flex items-center gap-1.5"><Baby className="h-4 w-4" />Profile dzieci</span>
            </h2>
            {user.profiles.length === 0 ? (
              <p className="text-sm text-slate-400">Brak profili dzieci.</p>
            ) : (
              <div className="space-y-2">
                {user.profiles.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.avatar ?? "🧒"}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.age} lat · {GENDER_LABEL[p.gender]}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{p._count.stories} bajek</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ostatnie bajki */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Ostatnie bajki
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tytuł</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dziecko</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Temat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {user.stories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                      Brak bajek.
                    </td>
                  </tr>
                )}
                {user.stories.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{s.title}</td>
                    <td className="px-4 py-3 text-slate-500">{s.childProfile.name}</td>
                    <td className="px-4 py-3 text-slate-500">{THEME_LABEL[s.theme] ?? s.theme}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700"
                        : s.status === "DRAFT" ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">
                      {s.createdAt.toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/bajki/${s.id}`} className="text-xs text-orange-600 hover:underline">
                        Podgląd →
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
