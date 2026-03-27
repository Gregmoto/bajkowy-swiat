import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  wariant?: "publiczna" | "aplikacja";
}

// Nawigacja — dwa warianty: publiczna (landing) i aplikacja (z avatarem użytkownika)
export default function Nawigacja({ wariant = "publiczna" }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
            Bajkowy Świat
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {wariant === "publiczna" ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Logowanie</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Zarejestruj się</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/kreator">+ Nowa bajka</Link>
              </Button>
              {/* TODO: Avatar użytkownika + dropdown */}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
