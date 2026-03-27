// Sekcja "Jak to działa" — 3 kroki z numerami
export default function HowItWorks() {
  const KROKI = [
    { nr: "01", tytul: "Opisz dziecko", opis: "Podaj imię, wiek, płeć i ulubione rzeczy Twojego dziecka." },
    { nr: "02", tytul: "Wybierz bajkę", opis: "Wybierz motyw: przygoda, magia, przyjaźń, zwierzęta lub kosmos." },
    { nr: "03", tytul: "Czytaj i ciesz się", opis: "AI tworzy unikalną bajkę w kilkanaście sekund. Gotowa do czytania!" },
  ];
  return (
    <section id="jak-to-dziala" className="py-16 container">
      <h2 className="text-3xl font-bold text-center mb-10">Jak to działa?</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {KROKI.map((krok) => (
          <div key={krok.nr} className="text-center space-y-3">
            <div className="text-5xl font-black text-primary/20">{krok.nr}</div>
            <h3 className="text-lg font-semibold">{krok.tytul}</h3>
            <p className="text-muted-foreground">{krok.opis}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
