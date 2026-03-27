import { BookOpen, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Widget statystyk — liczba bajek, dzieci, wygenerowanych historii
export default function StatystykiWidget() {
  const STATYSTYKI = [
    { ikona: <BookOpen className="h-5 w-5" />, label: "Bajek", wartosc: "0" },
    { ikona: <Users className="h-5 w-5" />, label: "Dzieci", wartosc: "0" },
    { ikona: <Sparkles className="h-5 w-5" />, label: "Motywów", wartosc: "5" },
  ];

  return (
    <>
      {STATYSTYKI.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="text-primary">{stat.ikona}</div>
            <div>
              <p className="text-2xl font-bold">{stat.wartosc}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
