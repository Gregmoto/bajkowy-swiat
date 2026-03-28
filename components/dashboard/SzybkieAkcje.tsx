import Link from "next/link";
import { Wand2, Users, BookOpen, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  maProfile: boolean;
}

export default function SzybkieAkcje({ maProfile }: Props) {
  const akcje = [
    {
      href: maProfile ? "/kreator" : "/dzieci/nowe",
      icon: Wand2,
      label: maProfile ? "Nowa bajka" : "Dodaj dziecko",
      opis: maProfile ? "Uruchom kreator" : "Zacznij od profilu",
      wyroznienie: true,
    },
    {
      href: "/dzieci",
      icon: Users,
      label: "Profile dzieci",
      opis: "Zarządzaj profilami",
      wyroznienie: false,
    },
    {
      href: "/biblioteka",
      icon: BookOpen,
      label: "Biblioteka",
      opis: "Wszystkie bajki",
      wyroznienie: false,
    },
    {
      href: "/ustawienia/konto",
      icon: Settings,
      label: "Ustawienia",
      opis: "Konto i subskrypcja",
      wyroznienie: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Szybkie akcje</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {akcje.map(({ href, icon: Icon, label, opis, wyroznienie }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors ${
              wyroznienie
                ? "bg-orange-50 hover:bg-orange-100 text-orange-700"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-semibold leading-tight">{label}</span>
            <span className="text-[10px] text-current opacity-60 leading-tight">
              {opis}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
