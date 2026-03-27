import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-36">
      {/* Subtila bakgrundscirklar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-32 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-sky-100/60 blur-3xl" />
      </div>

      <div className="container relative text-center max-w-3xl mx-auto px-6 space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700">
          <Sparkles className="h-4 w-4" />
          Bajki pisane przez AI — gotowe w 15 sekund
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
          Magiczne bajki,{" "}
          <span className="text-gradient">w których Twoje dziecko</span>{" "}
          jest bohaterem
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
          Podaj imię, wiek i ulubione rzeczy dziecka — AI tworzy unikalną,
          spersonalizowaną bajkę w kilkanaście sekund.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link href="/register" className="btn-cta text-base">
            Zacznij za darmo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#jak-to-dziala"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white/80 px-7 py-3 text-base font-semibold text-slate-700 hover:border-slate-300 hover:bg-white transition-all"
          >
            Jak to działa?
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-sm text-slate-400 pt-2">
          Bez karty kredytowej · 5 bajek za darmo · Anuluj kiedy chcesz
        </p>

        {/* Illustration placeholder */}
        <div className="mt-12 relative mx-auto max-w-lg">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/60 p-8 text-left space-y-3 animate-float">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🧚</span>
              <div>
                <div className="font-bold text-navy text-lg">Zosia i Zaczarowany Las</div>
                <div className="text-sm text-slate-400">Magia · 5 lat · Właśnie wygenerowana</div>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              &ldquo;Dawno, dawno temu w małym domku na skraju lasu mieszkała dziewczynka o imieniu Zosia, która miała różowego kota...&rdquo;
            </p>
            <div className="flex gap-2">
              <span className="rounded-full bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1">✨ Magia</span>
              <span className="rounded-full bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1">5 lat</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
