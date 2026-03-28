import { z } from "zod";

// ---------------------------------------------------------------------------
// Opcje
// ---------------------------------------------------------------------------
export const TEMATY_BAJEK = [
  { value: "KOSMOS",      label: "Kosmos",          emoji: "🚀", opis: "Gwiezdna podróż"         },
  { value: "DZUNGLA",     label: "Dżungla",          emoji: "🌿", opis: "Tropikalna przygoda"      },
  { value: "JEDNOROZCE",  label: "Jednorożce",       emoji: "🦄", opis: "Magiczny świat"           },
  { value: "SMOKI",       label: "Smoki",            emoji: "🐉", opis: "Rycerze i zamki"          },
  { value: "MORZE",       label: "Morze",            emoji: "🌊", opis: "Podwodna przygoda"        },
  { value: "LAS",         label: "Las",              emoji: "🌳", opis: "Leśne stworzenia"         },
  { value: "PRZYJAZN",    label: "Przyjaźń",         emoji: "🤝", opis: "Siła więzi"              },
  { value: "DOBRANOC",    label: "Bajka na dobranoc",emoji: "🌙", opis: "Spokojny sen"             },
] as const;

export const TONY_OPOWIESCI = [
  { value: "WESOLA",         label: "Wesoła i zabawna",      emoji: "😄" },
  { value: "PRZYGODOWA",     label: "Pełna przygód",         emoji: "⚔️"  },
  { value: "USPOKAJAJACA",   label: "Uspokajająca",          emoji: "🌙" },
  { value: "WZRUSZAJACA",    label: "Wzruszająca",           emoji: "💛" },
  { value: "EDUKACYJNA",     label: "Edukacyjna",            emoji: "🔬" },
] as const;

export const DLUGOSCI_BAJKI = [
  { value: "SHORT",  label: "Krótka",  opis: "ok. 2–3 min",  emoji: "⚡" },
  { value: "MEDIUM", label: "Średnia", opis: "ok. 5 min",    emoji: "📖" },
  { value: "LONG",   label: "Długa",   opis: "ok. 10 min",   emoji: "📚" },
] as const;

export type TematBajki    = typeof TEMATY_BAJEK[number]["value"];
export type TonOpowiesci  = typeof TONY_OPOWIESCI[number]["value"];
export type DlugoscBajki  = typeof DLUGOSCI_BAJKI[number]["value"];

// ---------------------------------------------------------------------------
// Mapowanie temat → StoryTheme enum
// ---------------------------------------------------------------------------
export const TEMAT_DO_THEME: Record<TematBajki, string> = {
  KOSMOS:     "SPACE",
  DZUNGLA:    "ADVENTURE",
  JEDNOROZCE: "MAGIC",
  SMOKI:      "ADVENTURE",
  MORZE:      "ADVENTURE",
  LAS:        "NATURE",
  PRZYJAZN:   "FRIENDSHIP",
  DOBRANOC:   "FAIRY_TALE",
};

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
export const kreatorSchema = z.object({
  childProfileId: z
    .string({ required_error: "Wybierz profil dziecka" })
    .min(1, "Wybierz profil dziecka"),

  temat: z.enum(
    TEMATY_BAJEK.map((t) => t.value) as [TematBajki, ...TematBajki[]],
    { required_error: "Wybierz temat bajki" }
  ),

  ton: z.enum(
    TONY_OPOWIESCI.map((t) => t.value) as [TonOpowiesci, ...TonOpowiesci[]],
    { required_error: "Wybierz ton opowieści" }
  ),

  dlugosc: z.enum(
    DLUGOSCI_BAJKI.map((d) => d.value) as [DlugoscBajki, ...DlugoscBajki[]],
    { required_error: "Wybierz długość bajki" }
  ),

  moral: z
    .string()
    .max(200, "Morał może mieć maksymalnie 200 znaków")
    .trim()
    .optional()
    .or(z.literal("")),

  extra: z
    .string()
    .max(400, "Dodatkowe szczegóły mogą mieć maksymalnie 400 znaków")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type KreatorFormData = z.infer<typeof kreatorSchema>;
