import { Metadata } from "next";
import ProfilForm from "@/components/ustawienia/ProfilForm";

export const metadata: Metadata = {
  title: "Ustawienia konta — Bajkowy Świat",
};

// Ustawienia konta — imię, email, zmiana hasła, usunięcie konta
export default function UstawieniaKontoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Ustawienia konta</h1>
        <p className="text-muted-foreground">
          Zarządzaj swoim kontem i danymi osobowymi.
        </p>
      </div>
      <ProfilForm />
    </div>
  );
}
