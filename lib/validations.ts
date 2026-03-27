import { z } from "zod";

export const bajkaSchema = z.object({
  imie: z
    .string()
    .min(1, "Imię jest wymagane")
    .max(50, "Imię jest zbyt długie"),
  wiek: z
    .number({
      required_error: "Wiek jest wymagany",
      invalid_type_error: "Wiek musi być liczbą",
    })
    .min(2, "Wiek musi wynosić co najmniej 2 lata")
    .max(12, "Wiek musi wynosić maksymalnie 12 lat"),
  plec: z.enum(["chlopiec", "dziewczynka"], {
    required_error: "Płeć jest wymagana",
  }),
  motyw: z.enum(["przygoda", "magia", "przyjazn", "zwierzeta", "kosmos"], {
    required_error: "Motyw bajki jest wymagany",
  }),
  ulubZwierze: z.string().max(50, "Zbyt długa wartość").optional(),
  ulubKolor: z.string().max(30, "Zbyt długa wartość").optional(),
  ulubZabawka: z.string().max(50, "Zbyt długa wartość").optional(),
  dodatkowe: z
    .string()
    .max(200, "Maksymalnie 200 znaków")
    .optional(),
  moral: z.string().max(200, "Maksymalnie 200 znaków").optional(),
});

export type BajkaFormData = z.infer<typeof bajkaSchema>;
