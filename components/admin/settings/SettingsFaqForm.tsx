"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettingsGroup } from "@/lib/actions/settings";
import { Plus, Trash2, GripVertical } from "lucide-react";
import SaveButton from "./SaveButton";

interface FaqItem { q: string; a: string; }
interface Props { items: FaqItem[]; }

export default function SettingsFaqForm({ items: initial }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<FaqItem[]>(
    initial.length > 0 ? initial : [{ q: "", a: "" }]
  );
  const [pending, startTransition] = useTransition();

  function addItem() {
    setItems((prev) => [...prev, { q: "", a: "" }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateItem(i: number, field: "q" | "a", value: string) {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveSettingsGroup("faq", { "faq.items": items });
      router.push("/admin/ustawienia?section=faq&saved=1");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-400">Pytania i odpowiedzi wyświetlane na stronie FAQ. Przeciągaj, by zmienić kolejność.</p>
      {items.map((item, i) => (
        <div key={i} className="group border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-orange-200 transition-colors bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-slate-300" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-wide">#{i + 1}</span>
            </div>
            <button type="button" onClick={() => removeItem(i)}
              className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <input
              value={item.q}
              onChange={(e) => updateItem(i, "q", e.target.value)}
              placeholder="Pytanie…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <textarea
              value={item.a}
              onChange={(e) => updateItem(i, "a", e.target.value)}
              placeholder="Odpowiedź…"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-slate-700"
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
        <Plus className="h-4 w-4" /> Dodaj pytanie
      </button>
      <SaveButton pending={pending} />
    </form>
  );
}
