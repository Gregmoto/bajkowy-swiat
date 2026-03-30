"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";

const BREADCRUMBS: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/uzytkownicy": "Użytkownicy",
  "/admin/bajki":       "Bajki",
  "/admin/dzieci":      "Profile dzieci",
  "/admin/platnosci":   "Płatności",
  "/admin/subskrypcje": "Subskrypcje",
  "/admin/finanse":     "Finanse",
  "/admin/statystyki":  "Statystyki",
  "/admin/zgloszenia":  "Zgłoszenia",
  "/admin/logi":        "Logi audytu",
  "/admin/ustawienia":  "Ustawienia",
};

interface Props {
  adminName:  string;
  adminEmail: string;
}

export default function AdminTopbar({ adminName, adminEmail }: Props) {
  const pathname = usePathname();

  // Ustal sekcję z pathname
  const section = Object.keys(BREADCRUMBS)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  const sectionLabel = section ? BREADCRUMBS[section] : "Panel";

  // Czy jesteśmy na podstronie (np. /admin/bajki/[id])
  const isDetail = pathname !== section && section !== "/admin";
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 border-b border-slate-800/60 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">Panel</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="font-semibold text-white">{sectionLabel}</span>
        {isDetail && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-slate-400">Szczegóły</span>
          </>
        )}
      </div>

      {/* Prawa strona */}
      <div className="flex items-center gap-3">
        {/* Powiadomienia (dekoracyjne — można podpiąć w przyszłości) */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        {/* Admin avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-700/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-xs font-black text-orange-400 select-none">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none">{adminName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{adminEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
