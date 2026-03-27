const TEMATY = [
  {
    emoji: "⚔️",
    tytul: "Przygoda",
    opis: "Smoki, zamki, skarby i odważni rycerze. Dziecko wyrusza w epicką podróż pełną niespodzianek.",
    kolor: "from-amber-50 to-orange-50",
    obramowanie: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    emoji: "✨",
    tytul: "Magia",
    opis: "Czarodziejskie zaklęcia, tajemne księżyce i wróżki. Świat, gdzie niemożliwe staje się możliwe.",
    kolor: "from-violet-50 to-purple-50",
    obramowanie: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    emoji: "🤝",
    tytul: "Przyjaźń",
    opis: "Wzruszające opowieści o lojalności, pomocy i sile prawdziwej przyjaźni między różnymi bohaterami.",
    kolor: "from-pink-50 to-rose-50",
    obramowanie: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
  },
  {
    emoji: "🐾",
    tytul: "Zwierzęta",
    opis: "Gadające lisy, mądre sowy i zabawne misie. Świat natury oczami pełnych ciekawości małych zwierzątek.",
    kolor: "from-green-50 to-emerald-50",
    obramowanie: "border-green-200",
    badge: "bg-green-100 text-green-700",
  },
  {
    emoji: "🚀",
    tytul: "Kosmos",
    opis: "Podróże między gwiazdami, spotkania z przyjaznymi kosmitami i odkrywanie tajemnic Wszechświata.",
    kolor: "from-sky-50 to-blue-50",
    obramowanie: "border-sky-200",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    emoji: "🏰",
    tytul: "Bajka klasyczna",
    opis: "Królewny, wróżki i zakląte zamki w nowoczesnym wydaniu — klasyka, którą dzieci kochają od pokoleń.",
    kolor: "from-indigo-50 to-blue-50",
    obramowanie: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
  },
  {
    emoji: "🌿",
    tytul: "Przyroda",
    opis: "Leśne duchy, rzeki z sekretami i pory roku jako bohaterowie. Bajki uczące miłości do natury.",
    kolor: "from-lime-50 to-green-50",
    obramowanie: "border-lime-200",
    badge: "bg-lime-100 text-lime-700",
  },
];

export default function Themes() {
  return (
    <section className="py-24">
      <div className="container max-w-6xl mx-auto px-6 space-y-14">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
            Motywy bajek
          </span>
          <h2 className="text-3xl font-black sm:text-4xl">
            Wybierz motyw, który pokocha Twoje dziecko
          </h2>
          <p className="text-slate-500 text-lg">
            Każda bajka jest unikalna — ten sam motyw nigdy nie da takiej samej historii.
            AI tworzy świeżą opowieść za każdym razem.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TEMATY.map((temat) => (
            <div
              key={temat.tytul}
              className={`group relative rounded-2xl border-2 ${temat.obramowanie} bg-gradient-to-br ${temat.kolor} p-6 space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 cursor-default`}
            >
              <span className="text-4xl block transition-transform duration-200 group-hover:scale-110">
                {temat.emoji}
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900">{temat.tytul}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${temat.badge}`}>
                    Popular
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{temat.opis}</p>
              </div>
            </div>
          ))}

          {/* "i więcej" karta */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-6 flex flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">🎲</span>
            <div>
              <p className="font-black text-slate-600">Niespodzianka!</p>
              <p className="text-sm text-slate-400 mt-1">Losowy motyw wybrany przez AI</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
