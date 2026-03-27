import type { Plec } from "./bajka";

// Typy związane z profilami dzieci
export interface Dziecko {
  id: string;
  userId: string;
  imie: string;
  wiek: number;
  plec: Plec;
  ulubZwierze: string | null;
  ulubKolor: string | null;
  ulubZabawka: string | null;
  created: string;
  updated: string;
  _count?: {
    bajki: number;
  };
}

export interface DzieckoFormData {
  imie: string;
  wiek: number;
  plec: Plec;
  ulubZwierze?: string;
  ulubKolor?: string;
  ulubZabawka?: string;
}
