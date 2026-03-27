import { Metadata } from "next";
import DzieckoForm from "@/components/dzieci/DzieckoForm";

export const metadata: Metadata = {
  title: "Dodaj dziecko — Bajkowy Świat",
};

// Formularz dodawania nowego profilu dziecka
export default function NoweDzieckoPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dodaj profil dziecka</h1>
        <p className="text-muted-foreground">
          Profil dziecka pozwala personalizować bajki i śledzić historię.
        </p>
      </div>
      <DzieckoForm />
    </div>
  );
}
