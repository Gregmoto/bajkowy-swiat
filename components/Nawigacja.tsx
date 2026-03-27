import Link from "next/link";
import { BookOpen, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Nawigacja() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
            Bajkowy Świat
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Moje bajki</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/nowa-bajka" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Nowa bajka</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
