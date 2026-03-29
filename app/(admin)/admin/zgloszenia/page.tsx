import { prisma } from "@/lib/db";
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";
import { MessageSquare, ChevronRight } from "lucide-react";
import Link from "next/link";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { updateTicketStatus } from "@/lib/actions/support";

export const dynamic = "force-dynamic";

const SS: Record<TicketStatus, { bg: string; text: string; label: string; dot: string }> = {
  OPEN:             { bg: "bg-red-100",     text: "text-red-700",     label: "Nowe",            dot: "bg-red-500"     },
  IN_PROGRESS:      { bg: "bg-amber-100",   text: "text-amber-700",   label: "W trakcie",       dot: "bg-amber-500"   },
  WAITING_FOR_USER: { bg: "bg-blue-100",    text: "text-blue-700",    label: "Czeka na użytk.", dot: "bg-blue-500"    },
  RESOLVED:         { bg: "bg-emerald-100", text: "text-emerald-700", label: "Rozwiązane",      dot: "bg-emerald-500" },
  CLOSED:           { bg: "bg-slate-100",   text: "text-slate-500",   label: "Zamknięte",       dot: "bg-slate-400"   },
};
const PS: Record<TicketPriority, { bg: string; text: string; label: string }> = {
  LOW:    { bg: "bg-slate-100",  text: "text-slate-500",  label: "Niski"    },
  NORMAL: { bg: "bg-sky-100",    text: "text-sky-700",    label: "Normalny" },
  HIGH:   { bg: "bg-orange-100", text: "text-orange-700", label: "Wysoki"   },
  URGENT: { bg: "bg-red-100",    text: "text-red-700",    label: "Pilny"    },
};
const CL: Record<TicketCategory, string> = {
  BILLING: "Płatność", TECHNICAL: "Techniczny", CONTENT: "Treść",
  ACCOUNT: "Konto", FEATURE_REQUEST: "Propozycja", OTHER: "Inne",
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string; category?: string; q?: string };
}) {
  const statusFilter   = (searchParams.status   ?? "") as TicketStatus | "";
  const priorityFilter = (searchParams.priority ?? "") as TicketPriority | "";
  const categoryFilter = (searchParams.category ?? "") as TicketCategory | "";
  const q              = (searchParams.q        ?? "").trim();

  const where = {
    AND: [
      statusFilter   ? { status:   statusFilter   } : {},
      priorityFilter ? { priority: priorityFilter } : {},
      categoryFilter ? { category: categoryFilter } : {},
      q ? { OR: [
        { subject:     { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { user: { OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name:  { contains: q, mode: "insensitive" as const } },
        ]}},
      ]} : {},
    ],
  };

  const [tickets, statusCounts] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        user:     { select: { id: true, email: true, name: true } },
        messages: { select: { id: true }, where: { isInternal: false } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.supportTicket.groupBy({ by: ["status"], _count: true }),
  ]);

  const countMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
  const total    = statusCounts.reduce((a, s) => a + s._count, 0);

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-black text-slate-900">Zgłoszenia klientów</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tickets.length} wyników · {total} łącznie</p>
        </div>

        {/* Filtry statusu */}
        <div className="flex flex-wrap gap-2">
          <a href="/admin/zgloszenia"
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${!statusFilter ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
            Wszystkie
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${!statusFilter ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{total}</span>
          </a>
          {(Object.keys(SS) as TicketStatus[]).map((s) => {
            const active = statusFilter === s;
            return (
              <a key={s} href={active ? "/admin/zgloszenia" : `/admin/zgloszenia?status=${s}`}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${active ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : SS[s].dot}`} />
                {SS[s].label}
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{countMap[s] ?? 0}</span>
              </a>
            );
          })}
        </div>

        {/* Szukaj + filtry */}
        <form method="GET" className="flex flex-wrap gap-3 items-center">
          <input name="q" defaultValue={q} placeholder="Szukaj po temacie, emailu…"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-64" />
          <select name="priority" defaultValue={priorityFilter}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="">Wszystkie priorytety</option>
            {(Object.keys(PS) as TicketPriority[]).map((p) => <option key={p} value={p}>{PS[p].label}</option>)}
          </select>
          <select name="category" defaultValue={categoryFilter}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="">Wszystkie kategorie</option>
            {(Object.keys(CL) as TicketCategory[]).map((c) => <option key={c} value={c}>{CL[c]}</option>)}
          </select>
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <button type="submit" className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">Filtruj</button>
          {(q || priorityFilter || categoryFilter) && (
            <a href={statusFilter ? `/admin/zgloszenia?status=${statusFilter}` : "/admin/zgloszenia"}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors">Wyczyść</a>
          )}
        </form>

        {/* Empty state */}
        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquare className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Brak zgłoszeń</p>
            <p className="text-xs text-slate-400">Nie znaleziono zgłoszeń pasujących do filtrów.</p>
          </div>
        )}

        {/* Lista */}
        {tickets.length > 0 && (
          <div className="space-y-2">
            {tickets.map((ticket) => {
              const ss = SS[ticket.status];
              const ps = PS[ticket.priority];
              return (
                <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-4 p-5">
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${ss.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ss.bg} ${ss.text}`}>{ss.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ps.bg} ${ps.text}`}>{ps.label}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{CL[ticket.category]}</span>
                        {ticket.messages.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-slate-400"><MessageSquare className="h-3 w-3" />{ticket.messages.length}</span>
                        )}
                        <span className="ml-auto text-xs text-slate-400">
                          {ticket.createdAt.toLocaleDateString("pl-PL")}{" "}
                          {ticket.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">{ticket.subject}</p>
                      {ticket.user && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ticket.user.name} ·{" "}
                          <Link href={`/admin/uzytkownicy/${ticket.user.id}`} className="text-orange-600 hover:underline">{ticket.user.email}</Link>
                        </p>
                      )}
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{ticket.description}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Link href={`/admin/zgloszenia/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                        Szczegóły <ChevronRight className="h-3 w-3" />
                      </Link>
                      {ticket.status === "OPEN" && (
                        <AdminActionButton label="W trakcie" action={() => updateTicketStatus(ticket.id, "IN_PROGRESS")} variant="warning" />
                      )}
                      {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS" || ticket.status === "WAITING_FOR_USER") && (
                        <AdminActionButton label="Rozwiąż" action={() => updateTicketStatus(ticket.id, "RESOLVED")} variant="success" />
                      )}
                      {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
                        <AdminActionButton label="Zamknij" action={() => updateTicketStatus(ticket.id, "CLOSED")} variant="default" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
