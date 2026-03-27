import { Metadata } from "next";
import DzieckoForm from "@/components/dzieci/DzieckoForm";

export const metadata: Metadata = {
  title: "Edytuj profil dziecka — Bajkowy Świat",
};

// Edycja istniejącego profilu dziecka (formularz z wypełnionymi danymi)
export default function EdytujDzieckoPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Edytuj profil dziecka</h1>
      <DzieckoForm dzieckoId={params.id} />
    </div>
  );
}
