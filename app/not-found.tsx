import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="text-8xl">🔍</div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Strona nie znaleziona</h1>
        <p className="text-muted-foreground max-w-sm">
          Ups! Ta bajka gdzieś się zgubiła w magicznym lesie. Wróć na
          stronę główną.
        </p>
      </div>
      <Button asChild>
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Wróć do bajek
        </Link>
      </Button>
    </div>
  );
}
