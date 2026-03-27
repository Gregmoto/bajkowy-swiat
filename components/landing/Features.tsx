import { Sparkles, BookOpen, Heart, Shield } from "lucide-react";

const CECHY = [
  {
    ikona: <Sparkles className="h-6 w-6" />,
    tytul: "Spersonalizowane bajki",
    opis: "Każda bajka tworzona jest specjalnie dla Twojego dziecka — z jego imieniem, ulubionymi zwierzętami i kolorami.",
  },
  {
    ikona: <BookOpen className="h-6 w-6" />,
    tytul: "Bogata biblioteka",
    opis: "Przechowuj wszystkie bajki w jednym miejscu. Wróć do ulubionych historii kiedy chcesz.",
  },
  {
    ikona: <Heart className="h-6 w-6" />,
    tytul: "Dopasowane do wieku",
    opis: "AI dostosowuje język i złożoność fabuły do wieku dziecka — od 2 do 12 lat.",
  },
  {
    ikona: <Shield className="h-6 w-6" />,
    tytul: "Bezpieczne treści",
    opis: "Bajki są pozytywne, edukacyjne i zawsze kończą się szczęśliwie.",
  },
];

// Sekcja cech produktu — 4 karty z ikonami
export default function Features() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container space-y-10">
        <h2 className="text-3xl font-bold text-center">Dlaczego Bajkowy Świat?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CECHY.map((cecha) => (
            <div key={cecha.tytul} className="rounded-xl border bg-card p-6 space-y-3">
              <div className="text-primary">{cecha.ikona}</div>
              <h3 className="font-semibold">{cecha.tytul}</h3>
              <p className="text-sm text-muted-foreground">{cecha.opis}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
