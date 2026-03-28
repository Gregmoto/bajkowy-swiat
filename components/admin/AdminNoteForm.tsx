"use client";

import { useState, useTransition } from "react";
import { saveAdminNote } from "@/lib/actions/admin";

interface Props {
  userId: string;
  initialNote: string | null;
}

export default function AdminNoteForm({ userId, initialNote }: Props) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveAdminNote(userId, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Notatka widoczna tylko dla administratorów…"
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{note.length} / 1000 znaków</span>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Zapisuję…" : saved ? "Zapisano ✓" : "Zapisz notatkę"}
        </button>
      </div>
    </form>
  );
}
