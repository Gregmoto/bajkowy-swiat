import { Star, Quote } from "lucide-react";

const OPINIE = [
  {
    imie: "Anna Kowalska",
    rola: "Mama Zuzi (5 lat) i Tomka (8 lat)",
    avatar: "👩",
    gwiazdki: 5,
    wyroznienie: "Najlepszy wieczorny rytuał",
    tekst:
      "Odkąd zaczęłam używać Bajkowego Świata, wieczorne kładzenie spać zmieniło się nie do poznania. Zuzia z wypiekami na twarzy słucha, jak to ona ratuje smoka przed złym czarnoksiężnikiem. Tomek z kolei uwielbia bajki o kosmosie, gdzie on jest kapitanem statku. Polecam każdemu rodzicowi!",
  },
  {
    imie: "Marek Wiśniewski",
    rola: "Tata Kuby (7 lat)",
    avatar: "👨",
    gwiazdki: 5,
    wyroznienie: "Kuba pyta o bajkę sam z siebie",
    tekst:
      "Wcześniej kładzenie Kuby spać trwało wieczność. Teraz sam pyta: 'Tato, wygenerujemy dzisiaj bajkę?'. Jakość historii jest naprawdę zaskakująca — nie spodziewałem się, że AI poradzi sobie z taką kreatywnością. Bajki są spójne, wciągające i zawsze kończą się pozytywnie.",
  },
  {
    imie: "Katarzyna Nowak",
    rola: "Mama bliźniąt Oli i Igi (6 lat)",
    avatar: "👩‍🦰",
    gwiazdki: 5,
    wyroznienie: "Każda bajka to inne arcydzieło",
    tekst:
      "Mam bliźniaczki, więc dwie bajki dziennie — każda z imieniem innej córki. Obie są zachwycone! Co mnie urzekło? Bajki są naprawdę różne za każdym razem, nawet przy tym samym motywie. Przez miesiąc ani razu nie powtórzyła się historia. Absolutnie polecam.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="container max-w-6xl mx-auto px-6 space-y-14">
        {/* Nagłówek */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
            Opinie użytkowników
          </span>
          <h2 className="text-3xl font-black sm:text-4xl">
            Rodzice i dzieci są zachwyceni
          </h2>
          <p className="text-slate-500 text-lg">
            Dołącz do setek rodzin, które odkryły nowy sposób na wieczorne bajki.
          </p>
        </div>

        {/* Karty opinii */}
        <div className="grid gap-6 md:grid-cols-3">
          {OPINIE.map((opinia) => (
            <div key={opinia.imie} className="feature-card space-y-5 flex flex-col">
              {/* Gwiazdki */}
              <div className="flex gap-0.5">
                {[...Array(opinia.gwiazdki)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Wyróżnienie */}
              <p className="font-black text-slate-900 text-base">&ldquo;{opinia.wyroznienie}&rdquo;</p>

              {/* Ikona cytatu + tekst */}
              <div className="flex-1 relative">
                <Quote className="absolute -top-1 -left-1 h-8 w-8 text-orange-100" />
                <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                  {opinia.tekst}
                </p>
              </div>

              {/* Autor */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-xl">
                  {opinia.avatar}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{opinia.imie}</p>
                  <p className="text-xs text-slate-400">{opinia.rola}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Liczby statystyk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { liczba: "2 400+", opis: "bajek stworzonych" },
            { liczba: "800+", opis: "szczęśliwych rodzin" },
            { liczba: "4.9/5", opis: "średnia ocena" },
            { liczba: "15s", opis: "czas generowania" },
          ].map((stat) => (
            <div key={stat.opis} className="text-center space-y-1">
              <p className="text-3xl font-black text-gradient">{stat.liczba}</p>
              <p className="text-sm text-slate-500">{stat.opis}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
