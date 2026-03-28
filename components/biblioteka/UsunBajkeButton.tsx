"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { usunBajke } from "@/lib/actions/bajka";

interface Props {
  bajkaId: string;
  tytul: string;
}

export default function UsunBajkeButton({ bajkaId, tytul }: Props) {
  const [potwierdz, setPotwierdz] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!potwierdz) {
      setPotwierdz(true);
      // Auto-reset po 3s jeśli nie kliknie drugi raz
      setTimeout(() => setPotwierdz(false), 3000);
      return;
    }
    startTransition(async () => {
      await usunBajke(bajkaId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={potwierdz ? `Kliknij ponownie, aby usunąć „${tytul}"` : "Usuń bajkę"}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
        potwierdz
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "text-slate-400 hover:bg-red-50 hover:text-red-600"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {potwierdz ? "Potwierdź" : "Usuń"}
    </button>
  );
}
