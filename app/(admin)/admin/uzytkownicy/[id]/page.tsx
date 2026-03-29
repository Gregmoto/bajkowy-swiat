export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SubscriptionPlan, UserRole } from "@prisma/client";
import {
  ShieldCheck, BookOpen, Baby, ArrowLeft,
  AlertTriangle, CreditCard, Clock, FileText,
} from "lucide-react";
import AdminActionButton from "@/components/admin/AdminActionButton";
import AdminNoteForm from "@/components/admin/AdminNoteForm";
import {
  toggleBanUser, changeUserPlan, changeUserRole,
  deleteUser, toggleFlagUser, cancelSubscription, restoreSubscription,
} from "@/lib/actions/admin";

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
const THEME_LABEL: Record<string, string> = {
  ADVENTURE: "Przygoda", MAGIC: "Magia", FRIENDSHIP: "Przyjaźń",
  ANIMALS: "Zwierzęta", SPACE: "Kosmos", FAIRY_TALE: "Bajka", NATURE: "Przyroda",
};
const PAY_STATUS_STYLE: Record<string, string> = {
  SUCCEEDED: "bg-emerald-100 text-emerald-700",
  FAILED:    "bg-red-100 text-red-600",
  PENDING:   "bg-amber-100 text-amber-700",
  REFUNDED:  "bg-slate-100 text-slate-600",
};
function fmtZl(g: number) {
  return (g / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{children}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <Icon className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
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
      payments: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { stories: true, profiles: true, auditLogs: true, payments: true } },
    },
  });

  if (!user) notFound();

  const GENDER_LABEL: Record<string, string> = {
    BOY: "Chłopiec", GIRL: "Dziewczynka", OTHER: "Inne",
  };

  const totalPaid = user.payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Powrót */}
        <a href="/admin/uzytkownicy"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Wróć do listy użytkowników
        </a>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              {user.role === "ADMIN" && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-600">
                  <ShieldCheck className="h-3.5 w-3.5" />ADMIN
                </span>
              )}
              {user.isBanned && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">ZABLOKOWANY</span>
              )}
              {user.flaggedForReview && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />DO WERYFIKACJI
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
                : `Zablokować konto ${user.email}? Użytkownik nie będzie mógł się zalogować.`}
              action={() => toggleBanUser(user.id)}
              variant={user.isBanned ? "success" : "warning"}
            />
            <AdminActionButton
              label={user.flaggedForReview ? "Zdejmij flagę" : "Oznacz do weryfikacji"}
              action={() => toggleFlagUser(user.id)}
              variant={user.flaggedForReview ? "default" : "warning"}
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

        {/* Górny rząd: dane + subskrypcja + profile */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Dane konta */}
          <SectionCard title="Dane konta" icon={FileText}>
            <InfoRow label="ID">
              <span className="font-mono text-xs select-all">{user.id}</span>
            </InfoRow>
            <InfoRow label="Email">{user.email}</InfoRow>
            <InfoRow label="Rola">{user.role}</InfoRow>
            <InfoRow label="Zarejestrowany">{user.createdAt.toLocaleDateString("pl-PL")}</InfoRow>
            <InfoRow label="Ostatnia aktywność">
              {user.lastActiveAt ? user.lastActiveAt.toLocaleDateString("pl-PL") : "—"}
            </InfoRow>
            <InfoRow label="Bajki">{user._count.stories}</InfoRow>
            <InfoRow label="Profile dzieci">{user._count.profiles}</InfoRow>
            <InfoRow label="Płatności">{user._count.payments}</InfoRow>
            <InfoRow label="Przychód łączny">
              <span className="text-emerald-700 font-semibold">{fmtZl(totalPaid)}</span>
            </InfoRow>
            <InfoRow label="Logi aktywności">{user._count.auditLogs}</InfoRow>
          </SectionCard>

          {/* Subskrypcja */}
          <SectionCard title="Subskrypcja" icon={CreditCard}>
            {user.subscription ? (
              <>
                <InfoRow label="Plan">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_STYLE[user.subscription.plan]}`}>
                    {user.subscription.plan}
                  </span>
                </InfoRow>
                <InfoRow label="Status">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[user.subscription.status]}`}>
                    {user.subscription.status}
                  </span>
                </InfoRow>
                <InfoRow label="Okres">
                  {user.subscription.billingPeriod === "YEARLY" ? "Roczny" : "Miesięczny"}
                </InfoRow>
                <InfoRow label="Bajki w mies.">{user.subscription.storiesThisMonth}</InfoRow>
                {user.subscription.currentPeriodStart && (
                  <InfoRow label="Rozpoczęcie">{user.subscription.currentPeriodStart.toLocaleDateString("pl-PL")}</InfoRow>
                )}
                {user.subscription.currentPeriodEnd && (
                  <InfoRow label="Odnowienie">{user.subscription.currentPeriodEnd.toLocaleDateString("pl-PL")}</InfoRow>
                )}
                {user.subscription.canceledAt && (
                  <InfoRow label="Anulowano">{user.subscription.canceledAt.toLocaleDateString("pl-PL")}</InfoRow>
                )}
                {user.subscription.cancelAtPeriodEnd && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">Anulowanie na koniec okresu</p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Zmień plan:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["FREE", "STARTER", "PREMIUM"] as SubscriptionPlan[]).map((p) => (
                      <AdminActionButton key={p} label={p}
                        action={() => changeUserPlan(user.id, p)}
                        variant={user.subscription?.plan === p ? "success" : "default"}
                        className={user.subscription?.plan === p ? "ring-2 ring-emerald-300" : ""}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {user.subscription.status !== "CANCELED" ? (
                      <AdminActionButton label="Anuluj subskrypcję"
                        confirmMessage="Anulować subskrypcję tego użytkownika?"
                        action={() => cancelSubscription(user.id)}
                        variant="warning"
                      />
                    ) : (
                      <AdminActionButton label="Przywróć subskrypcję"
                        confirmMessage="Przywrócić subskrypcję tego użytkownika?"
                        action={() => restoreSubscription(user.id)}
                        variant="success"
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Brak subskrypcji</p>
            )}
          </SectionCard>

          {/* Profile dzieci */}
          <SectionCard title="Profile dzieci" icon={Baby}>
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
          </SectionCard>
        </div>

        {/* Historia płatności */}
        <SectionCard title="Historia płatności" icon={CreditCard}>
          {user.payments.length === 0 ? (
            <p className="text-sm text-slate-400">Brak płatności.</p>
          ) : (
            <div className="overflow-x-auto -m-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Opis</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Metoda</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Kwota</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID zewn.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {user.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <a href={`/admin/platnosci/${p.id}`} className="font-mono text-xs text-orange-600 hover:underline">
                          {p.id.slice(0, 10)}…
                        </a>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{p.description ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{p.paymentMethod}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        <span className={p.status === "SUCCEEDED" ? "text-emerald-700" : "text-slate-700"}>
                          {fmtZl(p.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAY_STATUS_STYLE[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 tabular-nums">
                        {p.createdAt.toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-slate-400">{p.stripePaymentId ?? "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Ostatnie bajki */}
        <SectionCard title="Ostatnie bajki" icon={BookOpen}>
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tytuł</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dziecko</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Temat</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {user.stories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">Brak bajek.</td>
                  </tr>
                )}
                {user.stories.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800 max-w-xs truncate">{s.title}</td>
                    <td className="px-5 py-3 text-slate-500">{s.childProfile.name}</td>
                    <td className="px-5 py-3 text-slate-500">{THEME_LABEL[s.theme] ?? s.theme}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700"
                        : s.status === "DRAFT" ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400 tabular-nums">
                      {s.createdAt.toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-5 py-3">
                      <a href={`/admin/bajki/${s.id}`} className="text-xs text-orange-600 hover:underline">Podgląd →</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Ostatnia aktywność */}
        <SectionCard title="Ostatnia aktywność (logi)" icon={Clock}>
          {user.auditLogs.length === 0 ? (
            <p className="text-sm text-slate-400">Brak logów aktywności.</p>
          ) : (
            <div className="space-y-2">
              {user.auditLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                    {log.resource && (
                      <p className="text-xs text-slate-400">
                        {log.resource}{log.resourceId ? ` · ${log.resourceId.slice(0, 12)}…` : ""}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 tabular-nums shrink-0 ml-4">
                    {log.createdAt.toLocaleDateString("pl-PL")} {log.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Notatka admina */}
        <SectionCard title="Notatka administratora" icon={FileText}>
          <AdminNoteForm userId={user.id} initialNote={user.adminNote} />
          {user.adminNote && (
            <div className="mt-3 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
              <p className="text-xs font-semibold text-orange-600 mb-1">Aktualna notatka:</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{user.adminNote}</p>
            </div>
          )}
        </SectionCard>

      </div>
    </main>
  );
}
