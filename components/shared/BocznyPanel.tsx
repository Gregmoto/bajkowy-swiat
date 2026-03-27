import Link from "next/link";
import { LayoutDashboard, Users, Wand2, BookOpen, Settings } from "lucide-react";

const MENU = [
  { href: "/dashboard",        ikona: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
  { href: "/dzieci",           ikona: <Users className="h-4 w-4" />,           label: "Profile dzieci" },
  { href: "/kreator",          ikona: <Wand2 className="h-4 w-4" />,           label: "Kreator bajki" },
  { href: "/biblioteka",       ikona: <BookOpen className="h-4 w-4" />,        label: "Biblioteka" },
  { href: "/ustawienia/konto", ikona: <Settings className="h-4 w-4" />,        label: "Ustawienia" },
];

// Boczny panel nawigacji dla zalogowanych użytkowników
export default function BocznyPanel() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-background/60">
      <nav className="flex flex-col gap-1 p-4 pt-6">
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {item.ikona}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
