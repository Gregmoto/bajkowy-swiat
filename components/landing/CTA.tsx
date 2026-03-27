import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-900 via-blue-900 to-slate-900 px-8 py-16 text-center text-white shadow-2xl">
          {/* Decorative blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl"
          />

          <div className="relative space-y-6">
            <div className="text-5xl animate-float">✨</div>
            <h2 className="text-3xl font-black sm:text-4xl text-white">
              Gotowy na pierwszą bajkę?
            </h2>
            <p className="text-lg text-blue-200 max-w-md mx-auto leading-relaxed">
              Dołącz do tysięcy rodziców, którzy już tworzą magiczne wspomnienia ze swoimi dziećmi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/register" className="btn-cta text-base">
                Zacznij za darmo — bez karty
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-sm text-blue-300">5 bajek gratis · Bez zobowiązań</p>
          </div>
        </div>
      </div>
    </section>
  );
}
