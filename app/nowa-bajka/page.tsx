import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import BajkaForm from "@/components/BajkaForm";

export const metadata: Metadata = {
  title: "Nowa bajka — Bajkowy Świat",
  description:
    "Stwórz spersonalizowaną bajkę dla swojego dziecka. Wypełnij formularz i poczekaj, aż AI napisze wyjątkową historię.",
};

export default function StronaNowaBajka() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Nagłówek */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Kreator bajek
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Stwórz nową bajkę
        </h1>
        <p className="text-muted-foreground">
          Wypełnij formularz, a nasz AI-bajkopis napisze wyjątkową historię,
          w której Twoje dziecko jest głównym bohaterem.
        </p>
      </div>

      {/* Formularz */}
      <BajkaForm />
    </div>
  );
}
