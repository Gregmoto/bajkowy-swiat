import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { TicketStatus, TicketPriority, TicketCategory } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, Lock, MessageSquare, User } from "lucide-react";
import AdminActionButton from "@/components/admin/AdminActionButton";
import TicketNoteForm from "@/components/admin/TicketNoteForm";
import { updateTicketStatus, updateTicketPriority } from "@/lib/actions/support";

export const dynamic = "force-dynamic";

const SS: Record<TicketStatus, { bg: string; text: string; label: string; border: string }> = {
  OPEN:             { bg: "bg-red-50",     text: "text-red-700",     label: "Nowe",            border: "border-red-200"     },
  IN_PROGRESS:      { bg: "bg-amber-50",   text: "text-amber-700",   label: "W trakcie",       border: "border-amber-200"   },
  WAITING_FOR_USER: { bg: "bg-blue-50",    text: "text-blue-700",    label: "Czeka na użytk.", border: "border-blue-200"    },
  RESOLVED:         { bg: "bg-emerald-50", text: "text-emerald-700", label: "Rozwiązane",      border: "border-emerald-200" },
  CLOSED:           { bg: "bg-slate-50",   text: "text-slate-500",   label: "Zamknięte",       border: "border-slate-200"   },
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

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      user:     { select: { id: true, name: true, email: true, createdAt: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { ticket: { select: { id: true } } }, // just to have the relation
      },
    },
  });

  if (!ticket) notFound();

  // Pobierz autorów wiadomości (admini)
  const authorIds = Array.from(new Set(ticket.messages.map((m) => m.authorId)));
  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, name: true, email: true, role: true },
  });
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));

  const ss = SS[ticket.status];
  const ps = PS[ticket.priority];

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Powrót */}
        <Link href="/admin/zgloszenia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Wróć do zgłoszeń
        </Link>

        {/* Nagłówek ticketu */}
        <div className={`rounded-2xl border p-6 ${ss.bg} ${ss.border}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${ss.bg} ${ss.text} border ${ss.border}`}>
                  {ss.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ps.bg} ${ps.text}`}>
                  {ps.label}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/70 text-slate-600">
                  {CL[ticket.category]}
                </span>
              </div>
              <h1 className={`text-xl font-black ${ss.text}`}>{ticket.subject}</h1>
              <p className="text-xs text-slate-400">
                ID: <code className="bg-white/60 px-1 rounded select-all font-mono">{ticket.id}</code>
                {" · "}Zgłoszono: {ticket.createdAt.toLocaleDateString("pl-PL")}{" "}
                {ticket.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                {ticket.updatedAt.getTime() !== ticket.createdAt.getTime() && (
                  <> · Aktualizacja: {ticket.updatedAt.toLocaleDateString("pl-PL")}</>
                )}
              </p>
            </div>

            {/* Zmiana statusu */}
            <div className="flex flex-col gap-2 shrink-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Zmień status:</p>
              <div className="flex flex-wrap gap-1.5">
                {ticket.status !== "IN_PROGRESS" && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                  <AdminActionButton label="W trakcie" action={() => updateTicketStatus(ticket.id, "IN_PROGRESS")} variant="warning" />
                )}
                {ticket.status !== "WAITING_FOR_USER" && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                  <AdminActionButton label="Czeka na użytkownika" action={() => updateTicketStatus(ticket.id, "WAITING_FOR_USER")} variant="default" />
                )}
                {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                  <AdminActionButton label="Rozwiąż" action={() => updateTicketStatus(ticket.id, "RESOLVED")} variant="success" />
                )}
                {ticket.status !== "CLOSED" && (
                  <AdminActionButton label="Zamknij" action={() => updateTicketStatus(ticket.id, "CLOSED")} variant="default" />
                )}
                {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
                  <AdminActionButton label="Otwórz ponownie" action={() => updateTicketStatus(ticket.id, "OPEN")} variant="warning" />
                )}
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Priorytet:</p>
              <div className="flex flex-wrap gap-1.5">
                {(["LOW", "NORMAL", "HIGH", "URGENT"] as TicketPriority[]).map((p) => (
                  <AdminActionButton
                    key={p}
                    label={PS[p].label}
                    action={() => updateTicketPriority(ticket.id, p)}
                    variant={ticket.priority === p ? "success" : "default"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Lewa: treść + wiadomości */}
          <div className="lg:col-span-2 space-y-6">

            {/* Oryginalna treść zgłoszenia */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                Treść zgłoszenia
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Historia wiadomości */}
            {ticket.messages.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  Wiadomości ({ticket.messages.filter((m) => !m.isInternal).length}) ·{" "}
                  <span className="text-amber-600">
                    Notatki wewnętrzne ({ticket.messages.filter((m) => m.isInternal).length})
                  </span>
                </h2>
                {ticket.messages.map((msg) => {
                  const author = authorMap[msg.authorId];
                  const isAdmin = author?.role === "ADMIN";
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-2xl border p-4 ${
                        msg.isInternal
                          ? "bg-amber-50 border-amber-200"
                          : isAdmin
                          ? "bg-orange-50 border-orange-200"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                            isAdmin ? "bg-orange-200 text-orange-700" : "bg-slate-200 text-slate-600"
                          }`}>
                            {(author?.name ?? "?")[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{author?.name ?? "Nieznany"}</span>
                          {isAdmin && (
                            <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Admin</span>
                          )}
                          {msg.isInternal && (
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                              <Lock className="h-2.5 w-2.5" /> Wewnętrzna
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {msg.createdAt.toLocaleDateString("pl-PL")}{" "}
                          {msg.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Formularz odpowiedzi / notatki */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-black text-slate-700 mb-4">Dodaj odpowiedź lub notatkę</h2>
              <TicketNoteForm ticketId={ticket.id} isAdmin={true} />
            </div>

          </div>

          {/* Prawa: meta */}
          <div className="space-y-4">

            {/* Użytkownik */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Użytkownik
              </h2>
              {ticket.user ? (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800 text-sm">{ticket.user.name}</p>
                  <p className="text-xs text-slate-400 break-all">{ticket.user.email}</p>
                  <p className="text-xs text-slate-400">
                    Konto od: {ticket.user.createdAt.toLocaleDateString("pl-PL")}
                  </p>
                  <Link
                    href={`/admin/uzytkownicy/${ticket.user.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline mt-1"
                  >
                    Profil użytkownika →
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Użytkownik anonimowy</p>
              )}
            </div>

            {/* Daty */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-sm font-black text-slate-700">Daty</h2>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Zgłoszono</p>
                <p className="text-sm text-slate-700">
                  {ticket.createdAt.toLocaleDateString("pl-PL")}{" "}
                  {ticket.createdAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Aktualizacja</p>
                <p className="text-sm text-slate-700">
                  {ticket.updatedAt.toLocaleDateString("pl-PL")}{" "}
                  {ticket.updatedAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Rozwiązano</p>
                  <p className="text-sm text-emerald-700">{ticket.resolvedAt.toLocaleDateString("pl-PL")}</p>
                </div>
              )}
              {ticket.closedAt && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Zamknięto</p>
                  <p className="text-sm text-slate-500">{ticket.closedAt.toLocaleDateString("pl-PL")}</p>
                </div>
              )}
              {ticket.assignedTo && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Przypisany admin</p>
                  <p className="text-xs font-mono text-slate-500">{ticket.assignedTo.slice(0, 12)}…</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
