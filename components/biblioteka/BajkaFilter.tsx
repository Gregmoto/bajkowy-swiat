"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ArrowUpDown } from "lucide-react";

const SORTOWANIA = [
  { value: "najnowsze", label: "Najnowsze" },
  { value: "najstarsze", label: "Najstarsze" },
  { value: "temat",     label: "Według tematu" },
  { value: "tytul",     label: "Według tytułu" },
];

const TEMATY = [
  { value: "",           label: "Wszystkie tematy" },
  { value: "SPACE",      label: "🚀 Kosmos" },
  { value: "ADVENTURE",  label: "⚔️ Przygoda" },
  { value: "MAGIC",      label: "✨ Magia" },
  { value: "NATURE",     label: "🌿 Przyroda / Dżungla" },
  { value: "ANIMALS",    label: "🐾 Zwierzęta" },
  { value: "FRIENDSHIP", label: "🤝 Przyjaźń" },
  { value: "FAIRY_TALE", label: "🌙 Bajka klasyczna" },
];

const STATUSY = [
  { value: "",          label: "Wszystkie statusy" },
  { value: "PUBLISHED", label: "Opublikowane" },
  { value: "DRAFT",     label: "Szkice" },
  { value: "ARCHIVED",  label: "Zarchiwizowane" },
];

export default function BajkaFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ustaw = useCallback(
    (klucz: string, wartosc: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (wartosc) params.set(klucz, wartosc);
      else params.delete(klucz);
      router.push(`/biblioteka?${params.toString()}`);
    },
    [router, searchParams]
  );

  const sortowanie = searchParams.get("sort") ?? "najnowsze";
  const temat      = searchParams.get("temat") ?? "";
  const status     = searchParams.get("status") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sortowanie */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <select
          value={sortowanie}
          onChange={(e) => ustaw("sort", e.target.value)}
          className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer"
          aria-label="Sortowanie"
        >
          {SORTOWANIA.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Filtr tematu */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <select
          value={temat}
          onChange={(e) => ustaw("temat", e.target.value)}
          className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer"
          aria-label="Filtr tematu"
        >
          {TEMATY.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Filtr statusu */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <select
          value={status}
          onChange={(e) => ustaw("status", e.target.value)}
          className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer"
          aria-label="Filtr statusu"
        >
          {STATUSY.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
