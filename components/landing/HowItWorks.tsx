const KROKI = [
  {
    nr: "01",
    emoji: "👶",
    tytul: "Opisz dziecko",
    opis: "Podaj imię, wiek, płeć i ulubione rzeczy Twojego dziecka.",
  },
  {
    nr: "02",
    emoji: "🎨",
    tytul: "Wybierz motyw bajki",
    opis: "Wybierz motyw: przygoda, magia, przyjaźń, zwierzęta lub kosmos.",
  },
  {
    nr: "03",
    emoji: "📖",
    tytul: "Czytaj i ciesz się",
    opis: "AI tworzy unikalną bajkę w kilkanaście sekund. Gotowa do czytania!",
  },
];

export default function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="py-20 bg-slate-50/70">
      <div className="container max-w-5xl mx-auto px-6 space-y-14">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black sm:text-4xl">Jak to działa?</h2>
          <p className="text-slate-500 text-lg">Trzy proste kroki do magicznej bajki.</p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {KROKI.map((krok) => (
            <div key={krok.nr} className="relative text-center space-y-4">
              <div className="step-number">{krok.nr}</div>
              <div className="text-5xl -mt-6">{krok.emoji}</div>
              <h3 className="text-lg font-bold">{krok.tytul}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{krok.opis}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
