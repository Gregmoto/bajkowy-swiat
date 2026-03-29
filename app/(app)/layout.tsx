import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, LayoutDashboard, Users, Wand2, BookOpen, Settings, LogOut, MessageSquare } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";

const MENU = [
  { href: "/dashboard",        icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dzieci",           icon: Users,           label: "Profile dzieci" },
  { href: "/kreator",          icon: Wand2,           label: "Kreator bajki" },
  { href: "/biblioteka",       icon: BookOpen,        label: "Biblioteka" },
  { href: "/ustawienia/konto", icon: Settings,        label: "Ustawienia" },
  { href: "/kontakt",          icon: MessageSquare,   label: "Kontakt"    },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      {/* Top bar */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="flex h-14 items-center justify-between px-6 max-w-[1400px] mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-lg">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-gradient">Bajkowy Świat</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/kreator" className="btn-cta text-sm py-1.5 px-4">
              + Nowa bajka
            </Link>
            {/* Avatar + wyloguj */}
            <form action={logoutAction}>
              <button
                type="submit"
                title="Wyloguj się"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-orange-700">
                  {initials}
                </span>
                <span className="hidden sm:inline">{session.name.split(" ")[0]}</span>
                <LogOut className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-slate-200/70 bg-white/60">
          <nav className="flex flex-col gap-0.5 p-3 pt-5">
            {MENU.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
