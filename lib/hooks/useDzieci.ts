"use client";

import { useState, useEffect } from "react";

export interface Dziecko {
  id: string;
  imie: string;
  wiek: number;
  plec: "chlopiec" | "dziewczynka";
  ulubZwierze: string | null;
  ulubKolor: string | null;
  _count?: { bajki: number };
}

// Hook do pobierania profili dzieci zalogowanego użytkownika
export function useDzieci() {
  const [dzieci, setDzieci] = useState<Dziecko[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dzieci")
      .then((res) => res.json())
      .then((dane) => {
        if (Array.isArray(dane)) setDzieci(dane);
        else setBlad(dane.error ?? "Błąd pobierania dzieci");
      })
      .catch(() => setBlad("Błąd sieci"))
      .finally(() => setLadowanie(false));
  }, []);

  return { dzieci, ladowanie, blad };
}
