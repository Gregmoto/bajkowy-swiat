import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  MOTYWY_LABELS,
  MOTYWY_EMOJI,
  MOTYWY_KOLORY,
  PLEC_LABELS,
  type Bajka,
} from "@/types";

interface BajkaKartaProps {
  bajka: Bajka;
}

export default function BajkaKarta({ bajka }: BajkaKartaProps) {
  const motywEmoji = MOTYWY_EMOJI[bajka.motyw] ?? "📖";
  const motywLabel = MOTYWY_LABELS[bajka.motyw] ?? bajka.motyw;
  const motywKolor =
    MOTYWY_KOLORY[bajka.motyw] ??
    "bg-gray-100 text-gray-800 border-gray-200";
  const plecLabel = PLEC_LABELS[bajka.plec] ?? bajka.plec;

  const preview = bajka.tresc.slice(0, 120).trim() + "…";

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-3xl" role="img" aria-label={motywLabel}>
            {motywEmoji}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${motywKolor}`}
          >
            {motywLabel}
          </span>
        </div>
        <CardTitle className="mt-2 line-clamp-2 text-lg leading-snug">
          {bajka.tytul}
        </CardTitle>
        <CardDescription>
          {bajka.imie}, {bajka.wiek} lat ({plecLabel})
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {preview}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(bajka.created)}</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/bajki/${bajka.id}`}
            className="flex items-center gap-1"
          >
            Czytaj
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
