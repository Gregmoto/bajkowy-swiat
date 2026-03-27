const KROKI = [
  {
    nr: "01",
    emoji: "👶",
    kolor: "bg-orange-50 border-orange-200",
    kolorNr: "text-orange-300",
    tytul: "Opisz swoje dziecko",
    opis: "Podaj imię, wiek, płeć i ulubione rzeczy — kolor, zwierzątko, zabawkę. Im więcej szczegółów, tym bardziej wyjątkowa bajka.",
    szczegoly: ["Imię i wiek", "Ulubione zwierzę", "Zainteresowania"],
  },
  {
    nr: "02",
    emoji: "🎨",
    kolor: "bg-violet-50 border-violet-200",
    kolorNr: "text-violet-300",
    tytul: "Wybierz motyw bajki",
    opis: "Zdecyduj, o czym ma być bajka — magiczna przygoda, przyjazny smok, podróż w kosmos, a może bajka z morałem?",
    szczegoly: ["7 motywów do wyboru", "Własne przesłanie", "Dodatkowe wskazówki"],
  },
  {
    nr: "03",
    emoji: "📖",
    kolor: "bg-emerald-50 border-emerald-200",
    kolorNr: "text-emerald-300",
    tytul: "Czytaj i zachwycaj",
    opis: "W kilkanaście sekund otrzymujesz gotową, unikalną bajkę. Zapisz ją w bibliotece i wracaj do niej kiedy chcesz.",
    szczegoly: ["Gotowa w 15 sekund", "Zapisana w bibliotece", "Czytaj offline"],
  },
];

export default function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="py-24 bg-slate-50/70">
      <div className="container max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
            Jak to działa
          </span>
          <h2 className="text-3xl font-black sm:text-4xl">
            Trzy kroki do magicznej bajki
          </h2>
          <p className="text-slate-500 text-lg">
            Stworzenie spersonalizowanej bajki nigdy nie było prostsze.
            Żadnej instalacji, żadnych długich formularzy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {KROKI.map((krok) => (
            <div
              key={krok.nr}
              className={`relative rounded-3xl border-2 ${krok.kolor} p-8 space-y-5`}
            >
              {/* Numer w tle */}
              <div className={`absolute top-6 right-8 text-8xl font-black ${krok.kolorNr} select-none leading-none`}>
                {krok.nr}
              </div>

              <span className="text-5xl block">{krok.emoji}</span>

              <div className="space-y-2 relative">
                <h3 className="text-xl font-black">{krok.tytul}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{krok.opis}</p>
              </div>

              <ul className="space-y-1.5 relative">
                {krok.szczegoly.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
