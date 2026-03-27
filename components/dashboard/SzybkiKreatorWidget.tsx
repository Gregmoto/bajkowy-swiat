import Link from "next/link";
import { Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Widget szybkiego dostępu do kreatora — CTA na dashboardzie
export default function SzybkiKreatorWidget() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          Stwórz nową bajkę
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Wybierz dziecko, motyw i kilka szczegółów — AI napisze wyjątkową historię w kilkanaście sekund.
        </p>
        <Button className="w-full" asChild>
          <Link href="/kreator">Uruchom kreator →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
