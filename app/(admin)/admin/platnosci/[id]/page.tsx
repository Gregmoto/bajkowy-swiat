export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, CreditCard } from "lucide-react";

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
  CARD: "Karta płatnicza", BLIK: "BLIK", TRANSFER: "Przelew bankowy", OTHER: "Inna",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right max-w-xs break-all">{children}</span>
    </div>
  );
}

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });

  if (!payment) notFound();

  return (
    <main className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <a href="/admin/platnosci"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Wróć do listy płatności
        </a>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <CreditCard className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Szczegóły płatności</h1>
            <p className="text-sm text-slate-400 font-mono">{payment.id}</p>
          </div>
        </div>

        {/* Status banner */}
        <div className={`rounded-2xl border px-5 py-4 flex items-center justify-between ${
          payment.status === "SUCCEEDED" ? "border-emerald-200 bg-emerald-50"
          : payment.status === "FAILED"  ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-slate-50"
        }`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kwota</p>
            <p className={`text-3xl font-black tabular-nums mt-0.5 ${
              payment.status === "SUCCEEDED" ? "text-emerald-700"
              : payment.status === "FAILED" ? "text-red-600"
              : "text-slate-700"
            }`}>{fmtZl(payment.amount)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_STYLE[payment.status]}`}>
            {payment.status}
          </span>
        </div>

        {/* Szczegóły */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Dane płatności</h2>
          <Row label="ID płatności">
            <span className="font-mono text-xs select-all">{payment.id}</span>
          </Row>
          <Row label="Kwota">{fmtZl(payment.amount)}</Row>
          <Row label="Waluta">{payment.currency}</Row>
          <Row label="Metoda płatności">{METHOD_LABEL[payment.paymentMethod]}</Row>
          <Row label="Typ">{payment.type ?? "—"}</Row>
          <Row label="Opis">{payment.description ?? "—"}</Row>
          <Row label="Status">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[payment.status]}`}>
              {payment.status}
            </span>
          </Row>
          <Row label="Data płatności">
            {payment.createdAt.toLocaleDateString("pl-PL")} {payment.createdAt.toLocaleTimeString("pl-PL")}
          </Row>
          <Row label="ID zewnętrzne (Stripe)">
            <span className="font-mono text-xs select-all">{payment.stripePaymentId ?? "—"}</span>
          </Row>
        </div>

        {/* Dane użytkownika */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3">Użytkownik</h2>
          <Row label="ID">
            <span className="font-mono text-xs select-all">{payment.user.id}</span>
          </Row>
          <Row label="Imię / Nazwa">{payment.user.name}</Row>
          <Row label="Email">{payment.user.email}</Row>
          <Row label="Rola">{payment.user.role}</Row>
          <div className="pt-3 mt-1">
            <a href={`/admin/uzytkownicy/${payment.user.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:underline font-medium">
              Przejdź do profilu użytkownika →
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
