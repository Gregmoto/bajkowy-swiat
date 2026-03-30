"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { editStoryMetadata } from "@/lib/actions/admin";

interface Props {
  storyId: string;
  title:   string;
  moral:   string;
  summary: string;
}

export default function StoryMetaForm({ storyId, title: initTitle, moral: initMoral, summary: initSummary }: Props) {
  const [editing, setEditing] = useState(false);
  const [title,   setTitle]   = useState(initTitle);
  const [moral,   setMoral]   = useState(initMoral);
  const [summary, setSummary] = useState(initSummary);
  const [saved,   setSaved]   = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await editStoryMetadata(storyId, { title, moral, summary });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function cancel() {
    setTitle(initTitle);
    setMoral(initMoral);
    setSummary(initSummary);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">Metadane bajki</h2>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold"
          >
            <Pencil className="h-3 w-3" /> Edytuj
          </button>
        </div>
        {saved && (
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Zapisano zmiany
          </p>
        )}
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Tytuł</p>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
        </div>
        {moral && (
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Morał</p>
            <p className="text-sm text-slate-700 italic">„{moral}"</p>
          </div>
        )}
        {summary && (
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Streszczenie</p>
            <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">Edycja metadanych</h2>
        <div className="flex gap-1">
          <button
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Check className="h-3 w-3" /> {pending ? "Zapisuję…" : "Zapisz"}
          </button>
          <button
            onClick={cancel}
            className="inline-flex items-center gap-1 text-xs border border-slate-200 text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="h-3 w-3" /> Anuluj
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Tytuł</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Morał</label>
          <input
            value={moral}
            onChange={(e) => setMoral(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wide block mb-1">Streszczenie</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
