"use client";

import { useState, useTransition } from "react";
import { addTicketMessage } from "@/lib/actions/support";

interface Props {
  ticketId: string;
  isAdmin?: boolean;
}

export default function TicketNoteForm({ ticketId, isAdmin = false }: Props) {
  const [content,    setContent]    = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [isPending,  startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await addTicketMessage(ticketId, content, isInternal);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setContent("");
        setIsInternal(false);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={isInternal ? "Notatka wewnętrzna (widoczna tylko dla adminów)…" : "Treść odpowiedzi…"}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        disabled={isPending}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-orange-500"
                disabled={isPending}
              />
              <span>Notatka wewnętrzna</span>
            </label>
          )}
          {saved  && <span className="text-xs font-semibold text-emerald-600">Zapisano ✓</span>}
          {error  && <span className="text-xs font-semibold text-rose-600">{error}</span>}
        </div>

        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isInternal
              ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {isPending ? "Wysyłanie…" : isInternal ? "Dodaj notatkę" : "Wyślij odpowiedź"}
        </button>
      </div>
    </form>
  );
}
