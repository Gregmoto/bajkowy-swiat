import { prisma } from "@/lib/db";
import { ReportStatus, ReportType } from "@prisma/client";
import { Flag, MessageSquare } from "lucide-react";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { updateReportStatus } from "@/lib/actions/admin";

const STATUS_STYLE: Record<ReportStatus, string> = {
  OPEN:        "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED:    "bg-emerald-100 text-emerald-700",
  CLOSED:      "bg-slate-100 text-slate-500",
};
const TYPE_STYLE: Record<ReportType, string> = {
  BUG:     "bg-red-50 text-red-600",
  CONTENT: "bg-amber-50 text-amber-600",
  BILLING: "bg-violet-50 text-violet-600",
  OTHER:   "bg-slate-50 text-slate-600",
};
const TYPE_LABEL: Record<ReportType, string> = {
  BUG: "Błąd", CONTENT: "Treść", BILLING: "Płatność", OTHER: "Inne",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const statusFilter = searchParams.status ?? "";
  const typeFilter   = searchParams.type   ?? "";

  const [reports, counts] = await Promise.all([
    prisma.report.findMany({
      where: {
        AND: [
          statusFilter ? { status: statusFilter as ReportStatus } : {},
          typeFilter   ? { type:   typeFilter   as ReportType   } : {},
        ],
      },
      include: { user: { select: { email: true, name: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.report.groupBy({ by: ["status"], _count: true }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black text-slate-900">Zgłoszenia</h1>
          <p className="text-sm text-slate-500 mt-0.5">{reports.length} wyników</p>
        </div>

        {/* Liczniki statusów */}
        <div className="flex flex-wrap gap-3">
          {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as ReportStatus[]).map((s) => (
            <a
              key={s}
              href={statusFilter === s ? "/admin/zgloszenia" : `/admin/zgloszenia?status=${s}`}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span>{s === "OPEN" ? "🔴" : s === "IN_PROGRESS" ? "🟡" : s === "RESOLVED" ? "🟢" : "⚫"}</span>
              {s}
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold ${statusFilter === s ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {countMap[s] ?? 0}
              </span>
            </a>
          ))}

          <form method="GET" className="flex gap-1.5 ml-auto">
            {(["", "BUG", "CONTENT", "BILLING", "OTHER"] as const).map((t) => (
              <button key={t} name="type" value={t} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  typeFilter === t
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {t ? TYPE_LABEL[t as ReportType] : "Wszystkie typy"}
              </button>
            ))}
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          </form>
        </div>

        {/* Pusta lista */}
        {reports.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquare className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Brak zgłoszeń</p>
            <p className="text-xs text-slate-400">
              {statusFilter
                ? `Brak zgłoszeń o statusie ${statusFilter}.`
                : "Nie ma żadnych zgłoszeń od użytkowników."}
            </p>
          </div>
        )}

        {/* Lista zgłoszeń */}
        {reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <Flag className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[r.type]}`}>
                          {TYPE_LABEL[r.type]}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                          {r.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {r.createdAt.toLocaleDateString("pl-PL")} {r.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{r.subject}</p>
                      {r.user && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.user.name} · <a href={`/admin/uzytkownicy/${r.userId}`} className="text-orange-600 hover:underline">{r.user.email}</a>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Akcje zmiany statusu */}
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {r.status === "OPEN" && (
                      <AdminActionButton
                        label="W trakcie"
                        action={() => updateReportStatus(r.id, "IN_PROGRESS")}
                        variant="warning"
                      />
                    )}
                    {(r.status === "OPEN" || r.status === "IN_PROGRESS") && (
                      <AdminActionButton
                        label="Rozwiąż"
                        action={() => updateReportStatus(r.id, "RESOLVED")}
                        variant="success"
                      />
                    )}
                    {r.status !== "CLOSED" && (
                      <AdminActionButton
                        label="Zamknij"
                        action={() => updateReportStatus(r.id, "CLOSED")}
                        variant="default"
                      />
                    )}
                  </div>
                </div>

                {/* Treść */}
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{r.description}</p>
                </div>

                {/* Notatka admina */}
                {r.adminNote && (
                  <div className="mt-3 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
                    <p className="text-xs font-semibold text-orange-600 mb-1">Notatka admina:</p>
                    <p className="text-sm text-slate-700">{r.adminNote}</p>
                  </div>
                )}

                {/* Rozwiązane przez */}
                {r.resolvedAt && (
                  <p className="mt-2 text-xs text-slate-400">
                    Zamknięte: {r.resolvedAt.toLocaleDateString("pl-PL")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
