"use client";

import { useState, useEffect } from "react";
import type { Bajka } from "@/types";

// Hook do pobierania bajek użytkownika po stronie klienta (SWR/fetch)
export function useBajki(filtr?: { motyw?: string; dzieckoId?: string }) {
  const [bajki, setBajki] = useState<Bajka[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtr?.motyw) params.set("motyw", filtr.motyw);
    if (filtr?.dzieckoId) params.set("dzieckoId", filtr.dzieckoId);

    fetch(`/api/bajki?${params}`)
      .then((res) => res.json())
      .then((dane) => {
        if (Array.isArray(dane)) setBajki(dane);
        else setBlad(dane.error ?? "Błąd pobierania bajek");
      })
      .catch(() => setBlad("Błąd sieci"))
      .finally(() => setLadowanie(false));
  }, [filtr?.motyw, filtr?.dzieckoId]);

  return { bajki, ladowanie, blad };
}
