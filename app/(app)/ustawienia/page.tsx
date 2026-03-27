import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ustawienia — Bajkowy Świat",
};

// Przekierowanie do sekcji konto (domyślna zakładka ustawień)
export default function UstawieniaPage() {
  redirect("/ustawienia/konto");
}
