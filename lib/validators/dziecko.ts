import { z } from "zod";

export const profilDzieckaSchema = z.object({
  name: z
    .string({ required_error: "Imię jest wymagane" })
    .min(2, "Imię musi mieć co najmniej 2 znaki")
    .max(50, "Imię może mieć maksymalnie 50 znaków")
    .trim(),

  age: z.coerce
    .number({ invalid_type_error: "Podaj prawidłowy wiek" })
    .int("Wiek musi być liczbą całkowitą")
    .min(1, "Wiek musi wynosić co najmniej 1 rok")
    .max(18, "Wiek może wynosić maksymalnie 18 lat"),

  gender: z.enum(["BOY", "GIRL", "OTHER"], {
    required_error: "Wybierz płeć",
    invalid_type_error: "Wybierz prawidłową płeć",
  }),

  interests: z.array(z.string()).default([]),

  favoriteColor: z
    .string()
    .max(30, "Kolor może mieć maksymalnie 30 znaków")
    .trim()
    .optional()
    .or(z.literal("")),

  favoriteAnimal: z
    .string()
    .max(30, "Zwierzę może mieć maksymalnie 30 znaków")
    .trim()
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(500, "Notatki mogą mieć maksymalnie 500 znaków")
    .trim()
    .optional()
    .or(z.literal("")),

  avatar: z.string().optional().or(z.literal("")),
});

export type ProfilDzieckaInput = z.infer<typeof profilDzieckaSchema>;
