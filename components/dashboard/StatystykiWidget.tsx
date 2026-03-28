import { BookOpen, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  liczbaBajek: number;
  liczbaDzieci: number;
}

export default function StatystykiWidget({ liczbaBajek, liczbaDzieci }: Props) {
  const statystyki = [
    { ikona: <BookOpen className="h-5 w-5" />, label: "Bajek", wartosc: liczbaBajek },
    { ikona: <Users className="h-5 w-5" />, label: "Dzieci", wartosc: liczbaDzieci },
    { ikona: <Sparkles className="h-5 w-5" />, label: "Motywów", wartosc: 7 },
  ];

  return (
    <>
      {statystyki.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              {stat.ikona}
            </div>
            <div>
              <p className="text-2xl font-black">{stat.wartosc}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
