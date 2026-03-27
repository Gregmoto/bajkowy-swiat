import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Props {
  wariant?: "publiczna" | "aplikacja";
}

export default function Nawigacja({ wariant = "publiczna" }: Props) {
  return (
    <header className="sticky top-0 z-50 nav-glass">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-6">
        <Link href="/" className="flex items-center gap-2 font-black text-xl">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <span className="text-gradient">Bajkowy Świat</span>
        </Link>

        <nav className="flex items-center gap-3">
          {wariant === "publiczna" ? (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
              >
                Logowanie
              </Link>
              <Link href="/register" className="btn-cta text-sm py-2 px-5">
                Zarejestruj się
              </Link>
            </>
          ) : (
            <Link href="/kreator" className="btn-cta text-sm py-2 px-5">
              + Nowa bajka
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
