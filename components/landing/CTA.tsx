import Link from "next/link";
import { Button } from "@/components/ui/button";

// Sekcja CTA na dole landing page — ostatnie wezwanie do działania
export default function CTA() {
  return (
    <section className="py-20 container text-center space-y-6">
      <h2 className="text-3xl font-bold sm:text-4xl">
        Gotowy na pierwszą bajkę?
      </h2>
      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        Dołącz do tysięcy rodziców, którzy już tworzą magiczne wspomnienia ze swoimi dziećmi.
      </p>
      <Button size="lg" asChild>
        <Link href="/register">Zacznij za darmo — bez karty</Link>
      </Button>
    </section>
  );
}
