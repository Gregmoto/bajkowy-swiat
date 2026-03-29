import { prisma } from "@/lib/db";
import { ScrollText, Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ACTION_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  "user.ban":                       { bg: "bg-rose-100",    text: "text-rose-700",    label: "Ban użytkownika"       },
  "user.unban":                     { bg: "bg-emerald-100", text: "text-emerald-700", label: "Odbanowano"            },
  "user.delete":                    { bg: "bg-red-100",     text: "text-red-700",     label: "Usunięto użytkownika"  },
  "user.role_change":               { bg: "bg-violet-100",  text: "text-violet-700",  label: "Zmiana roli"           },
  "user.note_update":               { bg: "bg-slate-100",   text: "text-slate-600",   label: "Notatka zaktualizowana"},
  "user.flag":                      { bg: "bg-amber-100",   text: "text-amber-700",   label: "Oznaczono do weryfikacji"},
  "user.unflag":                    { bg: "bg-slate-100",   text: "text-slate-600",   label: "Odznaczono flagę"      },
  "story.delete":                   { bg: "bg-red-100",     text: "text-red-700",     label: "Usunięto bajkę"        },
  "story.status_change":            { bg: "bg-orange-100",  text: "text-orange-700",  label: "Status bajki"          },
  "subscription.cancel":            { bg: "bg-amber-100",   text: "text-amber-700",   label: "Anulowano subskrypcję" },
  "subscription.restore":           { bg: "bg-emerald-100", text: "text-emerald-700", label: "Przywrócono subskrypcję"},
  "subscription.plan_change":       { bg: "bg-blue-100",    text: "text-blue-700",    label: "Zmiana planu"          },
  "subscription.billing_period_change": { bg: "bg-blue-50", text: "text-blue-600",   label: "Zmiana okresu"         },
  "child_profile.delete":           { bg: "bg-red-50",      text: "text-red-600",     label: "Usunięto profil dziecka"},
  "ticket.status_change":           { bg: "bg-slate-100",   text: "text-slate-600",   label: "Status zgłoszenia"     },
  "ticket.message_add":             { bg: "bg-slate-50",    text: "text-slate-500",   label: "Notatka do zgłoszenia" },
  "ticket.delete":                  { bg: "bg-red-50",      text: "text-red-600",     label: "Usunięto zgłoszenie"   },
  "report.status_change":           { bg: "bg-slate-100",   text: "text-slate-600",   label: "Status raportu"        },
  "payment.status_change":          { bg: "bg-violet-100",  text: "text-violet-700",  label: "Zmiana statusu płatności"},
};

function ActionBadge({ action }: { action: string }) {
  const s = ACTION_STYLE[action];
  if (s) {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600">
      {action}
    </span>
  );
}

function formatMeta(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "";
  const entries = Object.entries(meta as Record<string, unknown>)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}: ${String(v)}`);
  return entries.join(" · ");
}

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { q?: string; resource?: string; page?: string };
}) {
  const q        = (searchParams.q        ?? "").trim();
  const resource = (searchParams.resource ?? "").trim();
  const page     = Math.max(1, parseInt(searchParams.page ?? "1"));
  const PER_PAGE = 50;

  const where = {
    AND: [
      q        ? { action: { contains: q, mode: "insensitive" as const } } : {},
      resource ? { resource: { equals: resource, mode: "insensitive" as const } } : {},
    ],
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take:    PER_PAGE,
      skip:    (page - 1) * PER_PAGE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Zasoby do filtra
  const resources = await prisma.auditLog.findMany({
    distinct: ["resource"],
    select:   { resource: true },
    where:    { resource: { not: null } },
  });

  const totalPages = Math.ceil(total / PER_PAGE);

  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { q, resource, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "1" || (k === "page" && v !== "1")) p.set(k, v);
    });
    if (merged.page === "1") p.delete("page");
    const s = p.toString();
    return `/admin/logi${s ? `?${s}` : ""}`;
  }

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Logi audytu</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Historia działań administratorów · {total.toLocaleString("pl-PL")} wpisów
          </p>
        </div>

        {/* Filtry */}
        <form method="GET" className="flex flex-wrap gap-3 items-center">
          {/* Szukaj po akcji */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Szukaj akcji…"
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-52"
            />
          </div>

          {/* Filtr zasobu */}
          <select
            name="resource"
            defaultValue={resource}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Wszystkie zasoby</option>
            {resources.map((r) => (
              <option key={r.resource} value={r.resource ?? ""}>{r.resource}</option>
            ))}
          </select>

          <button type="submit" className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
            Filtruj
          </button>

          {(q || resource) && (
            <a href="/admin/logi" className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Wyczyść
            </a>
          )}
        </form>

        {/* Tabela */}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ScrollText className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Brak logów</p>
            <p className="text-xs text-slate-400">Logi audytu będą pojawiać się tutaj po wykonaniu akcji w panelu.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Kiedy</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Akcja</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Zasób</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID zasobu</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Szczegóły</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Kiedy */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs font-mono text-slate-600">
                            {log.createdAt.toLocaleDateString("pl-PL")}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {log.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </p>
                        </td>

                        {/* Admin */}
                        <td className="px-4 py-3">
                          {log.user ? (
                            <div>
                              <p className="font-medium text-slate-800 text-xs">{log.user.name}</p>
                              <p className="text-[10px] text-slate-400">{log.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">System</span>
                          )}
                        </td>

                        {/* Akcja */}
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{log.action}</p>
                        </td>

                        {/* Zasób */}
                        <td className="px-4 py-3">
                          {log.resource ? (
                            <span className="text-xs text-slate-600 font-medium">{log.resource}</span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* ID zasobu */}
                        <td className="px-4 py-3">
                          {log.resourceId ? (
                            <code className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded select-all">
                              {log.resourceId.slice(0, 12)}…
                            </code>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* Szczegóły (metadata) */}
                        <td className="px-4 py-3 max-w-xs">
                          {log.metadata ? (
                            <p className="text-[10px] text-slate-500 truncate">
                              {formatMeta(log.metadata)}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3">
                          {log.ipAddress ? (
                            <code className="text-[10px] font-mono text-slate-400">{log.ipAddress}</code>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginacja */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-400">
                  Strona {page} z {totalPages} · {total.toLocaleString("pl-PL")} wpisów
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <a
                      href={buildUrl({ page: String(page - 1) })}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      ← Poprzednia
                    </a>
                  )}
                  {page < totalPages && (
                    <a
                      href={buildUrl({ page: String(page + 1) })}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Następna →
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}
