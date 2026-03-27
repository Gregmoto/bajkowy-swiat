import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
      {/* Tło — ciepłe plamy świetlne */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute top-40 -right-20 h-64 w-64 rounded-full bg-amber-100/50 blur-2xl" />
        <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-sky-100/50 blur-2xl" />
      </div>

      <div className="container relative max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Lewa kolumna — tekst */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700">
              ✨ Bajki pisane przez AI — gotowe w 15 sekund
            </div>

            {/* Nagłówek */}
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-[3.2rem] leading-[1.1]">
              Twórz spersonalizowane bajki,{" "}
              <span className="text-gradient">w których Twoje dziecko jest bohaterem</span>
            </h1>

            {/* Podtytuł */}
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
              Podaj imię, wiek i ulubione rzeczy swojego dziecka — sztuczna inteligencja
              napisze wyjątkową bajkę skrojoną na miarę, która zachwyci malucha każdego wieczoru.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn-cta text-base px-8 py-3.5">
                Wypróbuj teraz
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#jak-to-dziala"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                Jak to działa?
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-700">4.9/5</span>
                <span className="text-sm text-slate-400">(2 400+ bajek)</span>
              </div>
              <div className="flex -space-x-2">
                {["👩", "👨", "👩‍🦰", "👨‍🦱", "👩‍🦳"].map((emoji, i) => (
                  <span
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-50 text-sm"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-500">Dołącz do 800+ rodziców</span>
            </div>

            {/* Mikro-benefity */}
            <div className="flex flex-wrap gap-3">
              {["5 bajek za darmo", "Bez karty kredytowej", "Anuluj kiedy chcesz"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Prawa kolumna — podgląd bajki */}
          <div className="relative hidden lg:block">
            <div className="animate-float">
              {/* Główna karta bajki */}
              <div className="rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="rounded-full bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1">✨ Magia</span>
                      <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1">6 lat</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight mt-2">
                      Maja i Smok Kolorowego Lasu
                    </h3>
                  </div>
                  <span className="text-4xl">🐉</span>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed">
                  &ldquo;Pewnego słonecznego poranka Maja — odważna dziewczynka z różową wstążką
                  we włosach — odkryła za starą jabłonią tajemne drzwi...&rdquo;
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">M</span>
                    <span className="text-xs text-slate-400">Napisana dla Mai · 2 min temu</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini karta — druga bajka */}
              <div className="absolute -bottom-6 -left-6 w-52 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-4 text-white shadow-xl shadow-indigo-200/60">
                <div className="text-2xl mb-1">🚀</div>
                <p className="text-xs font-bold">Kacper i Gwiezdna Przygoda</p>
                <p className="text-xs opacity-70 mt-0.5">Kosmos · 8 lat · Właśnie gotowa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
