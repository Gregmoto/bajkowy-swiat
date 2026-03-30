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
  Settings,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href:   string;
  label:  string;
  icon:   React.ElementType;
  exact?: boolean;
}

const NAV_GROUPS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Główne",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "Zarządzanie",
    items: [
      { href: "/admin/uzytkownicy", label: "Użytkownicy",    icon: Users    },
      { href: "/admin/bajki",       label: "Bajki",          icon: BookOpen },
      { href: "/admin/dzieci",      label: "Profile dzieci", icon: Baby     },
    ],
  },
  {
    title: "Finanse",
    items: [
      { href: "/admin/platnosci",   label: "Płatności",    icon: Banknote  },
      { href: "/admin/subskrypcje", label: "Subskrypcje",  icon: CreditCard },
      { href: "/admin/finanse",     label: "Finanse",      icon: Wallet    },
    ],
  },
  {
    title: "Analityka",
    items: [
      { href: "/admin/statystyki", label: "Statystyki", icon: BarChart3 },
    ],
  },
  {
    title: "Support",
    items: [
      { href: "/admin/zgloszenia", label: "Zgłoszenia",   icon: MessageSquare },
      { href: "/admin/logi",       label: "Logi audytu",  icon: ScrollText    },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/ustawienia", label: "Ustawienia", icon: Settings },
    ],
  },
];

interface Props {
  adminName: string;
}

export default function AdminSidebar({ adminName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-slate-900 text-white h-screen sticky top-0 border-r border-slate-800/60">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 shrink-0">
            <Sparkles className="h-4 w-4 text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white leading-none truncate">Bajkowy Świat</p>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Panel Admina</p>
          </div>
        </div>
      </div>

      {/* Nawigacja */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {NAV_GROUPS.map(({ title, items }) => (
          <div key={title}>
            <p className="px-2 mb-1 text-[9px] font-black uppercase tracking-widest text-slate-600">
              {title}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                      active
                        ? "bg-orange-500/15 text-orange-300"
                        : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-orange-400" : "text-slate-500")} />
                    <span className="truncate">{label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Stopka */}
      <div className="px-3 pb-3 pt-2 border-t border-slate-800/60 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-slate-500 hover:bg-slate-800/70 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Wróć do aplikacji
        </Link>
        <div className="flex items-center gap-2 px-2.5 py-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 shrink-0">
            <ShieldCheck className="h-3 w-3 text-orange-400" />
          </div>
          <span className="text-[11px] text-slate-500 truncate">{adminName}</span>
        </div>
      </div>
    </aside>
  );
}
