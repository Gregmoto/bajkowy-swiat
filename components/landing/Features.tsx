import { Sparkles, Shield, BookHeart, Clock, Globe, Repeat } from "lucide-react";

const CECHY = [
  {
    ikona: <Sparkles className="h-6 w-6" />,
    kolor: "bg-orange-100 text-orange-600",
    tytul: "100% spersonalizowana",
    opis: "Bajka zawiera imię dziecka, jego ulubione zwierzę, kolor i zainteresowania. Każda historia jest pisana od nowa — żadnych szablonów.",
  },
  {
    ikona: <Shield className="h-6 w-6" />,
    kolor: "bg-emerald-100 text-emerald-600",
    tytul: "Bezpieczne treści",
    opis: "Bajki są zawsze pozytywne, kończą się szczęśliwie i nie zawierają żadnych strasznych treści. Możesz czytać bez obaw.",
  },
  {
    ikona: <BookHeart className="h-6 w-6" />,
    kolor: "bg-rose-100 text-rose-600",
    tytul: "Morał dopasowany do wieku",
    opis: "AI dobiera przesłanie odpowiednie dla konkretnego dziecka — inne dla 3-latka, inne dla 10-latka. Bajki uczą i bawią jednocześnie.",
  },
  {
    ikona: <Clock className="h-6 w-6" />,
    kolor: "bg-sky-100 text-sky-600",
    tytul: "Gotowa w 15 sekund",
    opis: "Nie czekaj godzinami. Bajka jest generowana natychmiast — idealna nawet wtedy, gdy dziecko już leży w łóżku i czeka.",
  },
  {
    ikona: <Globe className="h-6 w-6" />,
    kolor: "bg-violet-100 text-violet-600",
    tytul: "Po polsku",
    opis: "Bajki pisane są pięknym, poprawnym językiem polskim, dopasowanym do wieku dziecka. Żadnych tłumaczeń, żadnych błędów.",
  },
  {
    ikona: <Repeat className="h-6 w-6" />,
    kolor: "bg-amber-100 text-amber-600",
    tytul: "Nieskończona różnorodność",
    opis: "Nawet przy tym samym motywie i imieniu AI zawsze tworzy nową, unikalną historię. Nigdy się nie powtarza.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-slate-50/70">
      <div className="container max-w-6xl mx-auto px-6 space-y-14">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
            Dlaczego rodzice to lubią
          </span>
          <h2 className="text-3xl font-black sm:text-4xl">
            Bajki, które dzieci chcą słuchać wciąż od nowa
          </h2>
          <p className="text-slate-500 text-lg">
            Koniec z &ldquo;ta bajka znowu&rdquo;. Każdego wieczoru nowa historia
            z Twoim dzieckiem w roli głównej.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CECHY.map((cecha) => (
            <div key={cecha.tytul} className="feature-card space-y-4">
              <div className={`inline-flex rounded-2xl p-3.5 ${cecha.kolor}`}>
                {cecha.ikona}
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-lg">{cecha.tytul}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{cecha.opis}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cytat / pull quote */}
        <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-8 text-center text-white space-y-3">
          <p className="text-xl font-black leading-snug">
            &ldquo;Moja córka zasnęła z uśmiechem. Po raz pierwszy w życiu sama poprosiła o bajkę.&rdquo;
          </p>
          <p className="text-orange-100 text-sm font-semibold">— Monika K., mama 5-letniej Zuzi</p>
        </div>
      </div>
    </section>
  );
}
