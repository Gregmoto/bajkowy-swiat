import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-8 py-20 text-center text-white shadow-2xl">
          {/* Dekoracyjne plamy */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative space-y-8">
            {/* Animowana ikona */}
            <div className="text-6xl animate-float inline-block">✨</div>

            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl text-white leading-tight">
                Pierwsza bajka za darmo.{" "}
                <span className="text-gradient-warm">Dziś wieczorem.</span>
              </h2>
              <p className="text-lg text-blue-200 leading-relaxed">
                Dołącz do setek rodziców, którzy odkryli jak sprawić, żeby
                wieczorne bajki stały się najpiękniejszym momentem dnia.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-cta text-base px-8 py-4">
                <Sparkles className="h-4 w-4" />
                Wypróbuj teraz — za darmo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mikro-benefity */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-300">
              {["✓ 5 bajek za darmo", "✓ Bez karty kredytowej", "✓ Gotowa w 15 sekund"].map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
