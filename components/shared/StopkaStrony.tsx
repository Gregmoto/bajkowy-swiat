import Link from "next/link";
import { Sparkles } from "lucide-react";

// Stopka strony — logo, linki, copyright
export default function StopkaStrony() {
  return (
    <footer className="border-t py-10">
      <div className="container grid gap-8 md:grid-cols-3">
        <div className="space-y-2">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Bajkowy Świat
          </Link>
          <p className="text-sm text-muted-foreground">
            Magiczne bajki tworzone przez AI dla Twojego dziecka.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm">Produkt</p>
          <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="#jak-to-dziala" className="hover:text-foreground">Jak to działa?</Link>
            <Link href="/register" className="hover:text-foreground">Zarejestruj się</Link>
          </nav>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm">Prawne</p>
          <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="/polityka-prywatnosci" className="hover:text-foreground">Polityka prywatności</Link>
            <Link href="/regulamin" className="hover:text-foreground">Regulamin</Link>
          </nav>
        </div>
      </div>
      <div className="container mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bajkowy Świat. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}
