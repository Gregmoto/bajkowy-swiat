const OPINIE = [
  {
    imie: "Anna K.",
    rola: "Mama 5-letniej Zosi",
    tekst: "Moja córka uwielbia bajki o sobie! Za każdym razem jest zachwycona tym, że to ona jest bohaterką.",
    avatar: "👩",
    gwiazdki: 5,
  },
  {
    imie: "Marek W.",
    rola: "Tata 7-letniego Kuby",
    tekst: "Świetny pomysł na wieczorne czytanie. Syn czeka na nową bajkę każdego dnia.",
    avatar: "👨",
    gwiazdki: 5,
  },
  {
    imie: "Kasia B.",
    rola: "Mama bliźniąt",
    tekst: "Jakość bajek jest niesamowita, a każde dziecko dostaje własną historię. Polecam każdemu rodzicowi!",
    avatar: "👩‍🦰",
    gwiazdki: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20">
      <div className="container max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black sm:text-4xl">Co mówią rodzice?</h2>
          <p className="text-slate-500 text-lg">Dołącz do tysięcy szczęśliwych rodzin.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {OPINIE.map((opinia) => (
            <div
              key={opinia.imie}
              className="feature-card space-y-5"
            >
              {/* Gwiazdki */}
              <div className="flex gap-1 text-orange-400 text-sm">
                {"★".repeat(opinia.gwiazdki)}
              </div>

              <p className="text-slate-600 leading-relaxed">
                &ldquo;{opinia.tekst}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <span className="text-3xl">{opinia.avatar}</span>
                <div>
                  <div className="font-bold text-sm">{opinia.imie}</div>
                  <div className="text-xs text-slate-400">{opinia.rola}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
