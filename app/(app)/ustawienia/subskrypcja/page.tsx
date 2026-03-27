import { Metadata } from "next";
import SubskrypcjaInfo from "@/components/ustawienia/SubskrypcjaInfo";

export const metadata: Metadata = {
  title: "Subskrypcja — Bajkowy Świat",
};

// Zarządzanie subskrypcją — plan, historia płatności, anulowanie
export default function SubskrypcjaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Subskrypcja</h1>
        <p className="text-muted-foreground">
          Zarządzaj swoim planem i płatnościami.
        </p>
      </div>
      <SubskrypcjaInfo />
    </div>
  );
}
