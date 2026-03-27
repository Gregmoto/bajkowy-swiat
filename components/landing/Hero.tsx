import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sekcja hero landing page — główny CTA, tytuł, opis wartości produktu
export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="container text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Bajki pisane przez AI dla Twojego dziecka
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Bajkowy Świat
          </span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Twórz magiczne, spersonalizowane bajki, w których{" "}
          <strong>Twoje dziecko jest głównym bohaterem</strong>. Każda bajka
          jest wyjątkowa i dostosowana do wieku i preferencji malca.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/register" className="flex items-center gap-2">
              Zacznij za darmo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#jak-to-dziala">Zobacz jak to działa</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
