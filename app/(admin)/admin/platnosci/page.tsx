export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { PaymentStatus, PaymentMethod } from "@prisma/client";
import { Search, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtZl(g: number) {
  return (g / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

const STATUS_STYLE: Record<string, string> = {
  SUCCEEDED: "bg-emerald-100 text-emerald-700",
  FAILED:    "bg-red-100 text-red-600",
  PENDING:   "bg-amber-100 text-amber-700",
  REFUNDED:  "bg-slate-100 text-slate-600",
};

const METHOD_LABEL: Record<string, string> = {
  CARD: "Karta", BLIK: "BLIK", TRANSFER: "Przelew", OTHER: "Inne",
};

// ---------------------------------------------------------------------------
// Strona
// ---------------------------------------------------------------------------
export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: {
    q?: string; status?: string; method?: string;
    from?: string; to?: string;
  };
}) {
  const q      = searchParams.q      ?? "";
  const status = searchParams.status ?? "";
  const method = searchParams.method ?? "";
  const from   = searchParams.from   ?? "";
  const to     = searchParams.to     ?? "";

  const fromDate = from ? new Date(from) : null;
  const toDate   = to   ? new Date(to + "T23:59:59") : null;

  const payments = await prisma.payment.findMany({
    where: {
      AND: [
        status ? { status: status as PaymentStatus } : {},
        method ? { paymentMethod: method as PaymentMethod } : {},
        fromDate ? { createdAt: { gte: fromDate } } : {},
        toDate   ? { createdAt: { lte: toDate   } } : {},
        q ? {
          user: {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name:  { contains: q, mode: "insensitive" } },
            ],
          },
        } : {},
      ],
    },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const totalSucceeded = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Płatności</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {payments.length} wyników · łączna wartość: <strong>{fmtZl(totalSucceeded)}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
            <Download className="h-3.5 w-3.5" />
            Eksport CSV — wkrótce
          </div>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap gap-3">

          {/* Wyszukiwarka */}
          <form method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input name="q" defaultValue={q} placeholder="Szukaj po emailu lub imieniu…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white w-72 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            {status && <input type="hidden" name="status" value={status} />}
            {method && <input type="hidden" name="method" value={method} />}
            {from   && <input type="hidden" name="from"   value={from} />}
            {to     && <input type="hidden" name="to"     value={to} />}
          </form>

          {/* Status */}
          <form method="GET" className="flex gap-1.5 flex-wrap">
            {(["", "SUCCEEDED", "FAILED", "PENDING", "REFUNDED"] as const).map((s) => (
              <button key={s} name="status" value={s} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  status === s ? "bg-orange-500 text-white border-orange-500"
                               : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {s || "Wszystkie statusy"}
              </button>
            ))}
            {q      && <input type="hidden" name="q"      value={q} />}
            {method && <input type="hidden" name="method" value={method} />}
            {from   && <input type="hidden" name="from"   value={from} />}
            {to     && <input type="hidden" name="to"     value={to} />}
          </form>

          {/* Metoda */}
          <form method="GET" className="flex gap-1.5 flex-wrap">
            {(["", "CARD", "BLIK", "TRANSFER", "OTHER"] as const).map((m) => (
              <button key={m} name="method" value={m} type="submit"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  method === m ? "bg-orange-500 text-white border-orange-500"
                               : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {m ? METHOD_LABEL[m] : "Wszystkie metody"}
              </button>
            ))}
            {q      && <input type="hidden" name="q"      value={q} />}
            {status && <input type="hidden" name="status" value={status} />}
            {from   && <input type="hidden" name="from"   value={from} />}
            {to     && <input type="hidden" name="to"     value={to} />}
          </form>

          {/* Zakres dat */}
          <form method="GET" className="flex items-center gap-2">
            <input type="date" name="from" defaultValue={from}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-orange-400" />
            <span className="text-xs text-slate-400">—</span>
            <input type="date" name="to" defaultValue={to}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-orange-400" />
            <button type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white text-slate-600 border-slate-200 hover:border-slate-300 transition-colors">
              Filtruj
            </button>
            {q      && <input type="hidden" name="q"      value={q} />}
            {status && <input type="hidden" name="status" value={status} />}
            {method && <input type="hidden" name="method" value={method} />}
          </form>

          {/* Reset */}
          {(q || status || method || from || to) && (
            <a href="/admin/platnosci"
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-500 hover:text-slate-700 transition-colors">
              ✕ Wyczyść filtry
            </a>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID płatności</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Użytkownik</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Opis / Typ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Metoda</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Kwota</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Waluta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ID zewn.</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-400">
                      Brak płatności spełniających kryteria.
                    </td>
                  </tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500 select-all" title={p.id}>
                        {p.id.slice(0, 10)}…
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/uzytkownicy/${p.user.id}`} className="hover:underline">
                        <p className="font-semibold text-slate-800">{p.user.name}</p>
                        <p className="text-xs text-slate-400">{p.user.email}</p>
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{p.description ?? "—"}</p>
                      {p.type && <p className="text-xs text-slate-400">{p.type}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{METHOD_LABEL[p.paymentMethod]}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      <span className={p.status === "SUCCEEDED" ? "text-emerald-700" : p.status === "FAILED" ? "text-red-600" : "text-slate-700"}>
                        {fmtZl(p.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.currency}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums">
                      {p.createdAt.toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-400">{p.stripePaymentId ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/platnosci/${p.id}`} className="text-xs text-orange-600 hover:underline font-medium">
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
