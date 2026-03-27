import { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DzieckoKarta from "@/components/dzieci/DzieckoKarta";

export const metadata: Metadata = {
  title: "Profile dzieci — Bajkowy Świat",
};

// Lista profili dzieci — każde dziecko ma własne preferencje i historię bajek
export default function DzieciPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile dzieci</h1>
          <p className="text-muted-foreground">
            Zarządzaj profilami dzieci, dla których tworzysz bajki.
          </p>
        </div>
        <Button asChild>
          <Link href="/dzieci/nowe">
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj dziecko
          </Link>
        </Button>
      </div>

      {/* TODO: Pobierz listę dzieci z DB i renderuj DzieckoKarta */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* {dzieci.map(d => <DzieckoKarta key={d.id} dziecko={d} />)} */}
      </div>
    </div>
  );
}
