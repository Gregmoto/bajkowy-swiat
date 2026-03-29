"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/lib/actions/support";
import { TicketCategory } from "@prisma/client";
import { MessageSquare, CheckCircle } from "lucide-react";

const CATEGORIES: { value: TicketCategory; label: string; desc: string }[] = [
  { value: "BILLING",         label: "Płatność",         desc: "Faktura, zwrot, problem z subskrypcją"    },
  { value: "TECHNICAL",       label: "Problem techniczny",desc: "Błąd aplikacji, coś nie działa"           },
  { value: "CONTENT",         label: "Treść bajki",       desc: "Nieodpowiednia treść, błąd w bajce"       },
  { value: "ACCOUNT",         label: "Konto",             desc: "Logowanie, dane konta, usunięcie konta"   },
  { value: "FEATURE_REQUEST", label: "Propozycja",        desc: "Sugestia nowej funkcji lub ulepszenia"    },
  { value: "OTHER",           label: "Inne",              desc: "Pytania ogólne i inne tematy"             },
];

export default function KontaktPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const [subject,  setSubject]  = useState("");
  const [category, setCategory] = useState<TicketCategory>("OTHER");
  const [desc,     setDesc]     = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) { setError("Podaj temat zgłoszenia."); return; }
    if (!desc.trim())    { setError("Opisz swój problem."); return; }

    startTransition(async () => {
      const result = await createTicket({ subject, description: desc, category });
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTicketId(result.id);
      }
    });
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl border border-emerald-200 p-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Zgłoszenie wysłane!</h1>
          <p className="text-slate-500 text-sm">
            Twoje zgłoszenie zostało przyjęte. Nasz zespół odpowie jak najszybciej, zazwyczaj w ciągu 24 godzin.
          </p>
          {ticketId && (
            <p className="text-xs text-slate-400">
              Numer zgłoszenia: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded select-all">{ticketId.slice(0, 16)}…</code>
            </p>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 text-white text-sm font-semibold px-6 py-2.5 hover:bg-orange-600 transition-colors"
          >
            Wróć do dashboardu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Nagłówek */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Kontakt i pomoc</h1>
        <p className="text-sm text-slate-500 mt-1">
          Masz problem lub pytanie? Wypełnij formularz — odpowiemy najszybciej jak to możliwe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Kategoria */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <label className="block text-sm font-black text-slate-700">
            Kategoria zgłoszenia <span className="text-red-500">*</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  category === cat.value
                    ? "border-orange-400 bg-orange-50 ring-1 ring-orange-400"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className={`text-sm font-semibold ${category === cat.value ? "text-orange-700" : "text-slate-800"}`}>
                  {cat.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Temat */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <label htmlFor="subject" className="block text-sm font-black text-slate-700">
            Temat <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Krótki opis problemu…"
            maxLength={200}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            disabled={isPending}
          />
        </div>

        {/* Opis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <label htmlFor="desc" className="block text-sm font-black text-slate-700">
            Opis <span className="text-red-500">*</span>
          </label>
          <textarea
            id="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={6}
            placeholder="Opisz szczegółowo swój problem lub pytanie. Im więcej szczegółów, tym szybciej pomożemy."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            disabled={isPending}
          />
          <p className="text-xs text-slate-400 text-right">{desc.length} znaków</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Zazwyczaj odpowiadamy w ciągu 24 godzin (dni robocze).
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 text-white text-sm font-semibold px-6 py-2.5 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-4 w-4" />
            {isPending ? "Wysyłanie…" : "Wyślij zgłoszenie"}
          </button>
        </div>

      </form>
    </div>
  );
}
