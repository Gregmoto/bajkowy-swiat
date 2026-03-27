import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import BajkaForm from "@/components/kreator/BajkaForm";
import KrokiKreatora from "@/components/kreator/KrokiKreatora";

export const metadata: Metadata = {
  title: "Kreator bajki — Bajkowy Świat",
};

// Kreator bajki — wieloetapowy formularz z wyborem dziecka i preferencji
export default function KreatorPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Kreator bajek
        </div>
        <h1 className="text-3xl font-bold">Stwórz nową bajkę</h1>
        <p className="text-muted-foreground">
          Wypełnij formularz, a AI napisze wyjątkową historię dla Twojego dziecka.
        </p>
      </div>
      <KrokiKreatora />
      <BajkaForm />
    </div>
  );
}
