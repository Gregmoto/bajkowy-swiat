export interface Bajka {
  id: string;
  tytul: string;
  tresc: string;
  imie: string;
  wiek: number;
  plec: string;
  motyw: string;
  ulubZwierze: string | null;
  ulubKolor: string | null;
  ulubZabawka: string | null;
  dodatkowe: string | null;
  moral: string | null;
  created: string;
  updated: string;
}

export const MOTYWY_LABELS: Record<string, string> = {
  przygoda: "Przygoda",
  magia: "Magia",
  przyjazn: "Przyjaźń",
  zwierzeta: "Zwierzęta",
  kosmos: "Kosmos",
};

export const MOTYWY_EMOJI: Record<string, string> = {
  przygoda: "🗺️",
  magia: "✨",
  przyjazn: "🤝",
  zwierzeta: "🦋",
  kosmos: "🚀",
};

export const MOTYWY_KOLORY: Record<string, string> = {
  przygoda: "bg-amber-100 text-amber-800 border-amber-200",
  magia: "bg-purple-100 text-purple-800 border-purple-200",
  przyjazn: "bg-rose-100 text-rose-800 border-rose-200",
  zwierzeta: "bg-green-100 text-green-800 border-green-200",
  kosmos: "bg-blue-100 text-blue-800 border-blue-200",
};

export const PLEC_LABELS: Record<string, string> = {
  chlopiec: "chłopiec",
  dziewczynka: "dziewczynka",
};
