import { Metadata } from "next";
import { BookOpen } from "lucide-react";
import BajkaFilter from "@/components/biblioteka/BajkaFilter";
import BajkaKarta from "@/components/biblioteka/BajkaKarta";

export const metadata: Metadata = {
  title: "Biblioteka bajek — Bajkowy Świat",
};

// Biblioteka bajek — wszystkie bajki użytkownika z filtrowaniem
export default function BiblotekaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Biblioteka bajek</h1>
          <p className="text-muted-foreground">
            Wszystkie wygenerowane bajki w jednym miejscu.
          </p>
        </div>
      </div>

      {/* Filtry: motyw, dziecko, data */}
      <BajkaFilter />

      {/* Siatka bajek */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* TODO: bajki.map(b => <BajkaKarta key={b.id} bajka={b} />) */}
      </div>
    </div>
  );
}
