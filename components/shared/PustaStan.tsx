import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  emoji?: string;
  tytul: string;
  opis: string;
  akcjaHref?: string;
  akcjaLabel?: string;
}

// Pusty stan — renderowany gdy lista jest pusta (bajki, dzieci, itp.)
export default function PustaStan({ emoji = "📭", tytul, opis, akcjaHref, akcjaLabel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center space-y-4">
      <div className="text-6xl">{emoji}</div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{tytul}</h3>
        <p className="text-muted-foreground max-w-xs text-sm">{opis}</p>
      </div>
      {akcjaHref && akcjaLabel && (
        <Button asChild>
          <Link href={akcjaHref}>{akcjaLabel}</Link>
        </Button>
      )}
    </div>
  );
}
