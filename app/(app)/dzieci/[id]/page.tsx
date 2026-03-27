import { Metadata } from "next";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BajkaKarta from "@/components/biblioteka/BajkaKarta";

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: "Profil dziecka — Bajkowy Świat",
};

// Szczegóły profilu dziecka + historia jego bajek
export default function ProfilDzieckaPage({ params }: Props) {
  return (
    <div className="space-y-8">
      {/* Nagłówek profilu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* DzieckoAvatar */}
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            👦
          </div>
          <div>
            <h1 className="text-2xl font-bold">Imię dziecka</h1>
            <p className="text-muted-foreground">5 lat • chłopiec</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dzieci/${params.id}/edytuj`}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edytuj profil
          </Link>
        </Button>
      </div>

      {/* Historia bajek dziecka */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Bajki dziecka</h2>
        {/* TODO: <BajkaKarta /> */}
      </section>
    </div>
  );
}
