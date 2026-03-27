import { Sparkles, BookOpen, Heart, Shield } from "lucide-react";

const CECHY = [
  {
    ikona: <Sparkles className="h-6 w-6" />,
    kolor: "bg-orange-100 text-orange-600",
    tytul: "Spersonalizowane bajki",
    opis: "Każda bajka tworzona jest specjalnie dla Twojego dziecka — z jego imieniem, ulubionymi zwierzętami i kolorami.",
  },
  {
    ikona: <BookOpen className="h-6 w-6" />,
    kolor: "bg-sky-100 text-sky-600",
    tytul: "Bogata biblioteka",
    opis: "Przechowuj wszystkie bajki w jednym miejscu. Wróć do ulubionych historii kiedy chcesz.",
  },
  {
    ikona: <Heart className="h-6 w-6" />,
    kolor: "bg-rose-100 text-rose-600",
    tytul: "Dopasowane do wieku",
    opis: "AI dostosowuje język i złożoność fabuły do wieku dziecka — od 2 do 12 lat.",
  },
  {
    ikona: <Shield className="h-6 w-6" />,
    kolor: "bg-emerald-100 text-emerald-600",
    tytul: "Bezpieczne treści",
    opis: "Bajki są pozytywne, edukacyjne i zawsze kończą się szczęśliwie.",
  },
];

export default function Features() {
  return (
    <section className="py-20">
      <div className="container max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black sm:text-4xl">
            Dlaczego Bajkowy Świat?
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Wszystko czego potrzebujesz, żeby tworzyć niezapomniane wieczory z bajkami.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CECHY.map((cecha) => (
            <div key={cecha.tytul} className="feature-card space-y-4">
              <div className={`inline-flex rounded-xl p-3 ${cecha.kolor}`}>
                {cecha.ikona}
              </div>
              <h3 className="font-bold text-base">{cecha.tytul}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{cecha.opis}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
