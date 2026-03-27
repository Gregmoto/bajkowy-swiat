"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  bajkaId: string;
}

export default function UsunBajkeButton({ bajkaId }: Props) {
  const router = useRouter();
  const [usuwanie, setUsuwanie] = useState(false);

  const handleUsun = async () => {
    if (!confirm("Czy na pewno chcesz usunąć tę bajkę? Tej operacji nie można cofnąć.")) {
      return;
    }

    setUsuwanie(true);
    try {
      const res = await fetch(`/api/bajki/${bajkaId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert("Nie udało się usunąć bajki. Spróbuj ponownie.");
        setUsuwanie(false);
      }
    } catch {
      alert("Wystąpił błąd sieci. Spróbuj ponownie.");
      setUsuwanie(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleUsun}
      disabled={usuwanie}
    >
      {usuwanie ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-2 h-4 w-4" />
      )}
      Usuń bajkę
    </Button>
  );
}
