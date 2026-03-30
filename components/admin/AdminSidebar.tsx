"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Baby,
  CreditCard,
  Banknote,
  BarChart3,
  Flag,
  ScrollText,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",            label: "Dashboard",       icon: LayoutDashboard, exact: true },
  { href: "/admin/uzytkownicy",label: "Użytkownicy",     icon: Users },
  { href: "/admin/bajki",      label: "Bajki",           icon: BookOpen },
  { href: "/admin/dzieci",     label: "Profile dzieci",  icon: Baby },
  { href: "/admin/platnosci",  label: "Płatności",       icon: Banknote },
  { href: "/admin/subskrypcje",label: "Subskrypcje",     icon: CreditCard },
  { href: "/admin/finanse",    label: "Finanse",         icon: Wallet     },
  { href: "/admin/statystyki", label: "Statystyki",      icon: BarChart3  },
  { href: "/admin/zgloszenia", label: "Zgłoszenia",      icon: Flag       },
  { href: "/admin/logi",       label: "Logi audytu",     icon: ScrollText },
];

interface Props {
  adminName: string;
}

export default function AdminSidebar({ adminName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-slate-900 text-white h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20">
            <Sparkles className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-none">Bajkowy Świat</p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Panel Admina</p>
          </div>
        </div>
      </div>

      {/* Nawigacja */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-orange-500/15 text-orange-300 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Stopka */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-700/60 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Wróć do aplikacji
        </Link>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <span className="text-xs text-slate-400 truncate">{adminName}</span>
        </div>
      </div>
    </aside>
  );
}
