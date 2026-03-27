// Typy związane z bajkami
export type Motyw = "przygoda" | "magia" | "przyjazn" | "zwierzeta" | "kosmos";
export type Plec = "chlopiec" | "dziewczynka";

export interface Bajka {
  id: string;
  tytul: string;
  tresc: string;
  imie: string;
  wiek: number;
  plec: Plec;
  motyw: Motyw;
  ulubZwierze: string | null;
  ulubKolor: string | null;
  ulubZabawka: string | null;
  dodatkowe: string | null;
  moral: string | null;
  created: string;
  updated: string;
}

export interface GenerujBajkeRequest {
  imie: string;
  wiek: number;
  plec: Plec;
  motyw: Motyw;
  ulubZwierze?: string;
  ulubKolor?: string;
  ulubZabawka?: string;
  dodatkowe?: string;
  moral?: string;
}
