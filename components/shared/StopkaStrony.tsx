import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function StopkaStrony() {
  return (
    <footer className="border-t border-slate-200 bg-white/60 py-12">
      <div className="container max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-black text-lg">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="text-gradient">Bajkowy Świat</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            Magiczne, spersonalizowane bajki<br />tworzone przez AI dla Twojego dziecka.
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-bold text-sm text-slate-700">Produkt</p>
          <nav className="flex flex-col gap-2 text-sm text-slate-400">
            <Link href="#jak-to-dziala" className="hover:text-slate-700 transition-colors">Jak to działa?</Link>
            <Link href="/register" className="hover:text-slate-700 transition-colors">Zarejestruj się</Link>
          </nav>
        </div>
        <div className="space-y-3">
          <p className="font-bold text-sm text-slate-700">Prawne</p>
          <nav className="flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/polityka-prywatnosci" className="hover:text-slate-700 transition-colors">Polityka prywatności</Link>
            <Link href="/regulamin" className="hover:text-slate-700 transition-colors">Regulamin</Link>
          </nav>
        </div>
      </div>
      <div className="container max-w-6xl mx-auto px-6 mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Bajkowy Świat. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}
