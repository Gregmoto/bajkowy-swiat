import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Podaj prawidłowy adres email"),
  password: z
    .string()
    .min(1, "Hasło jest wymagane"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Imię musi mieć co najmniej 2 znaki")
      .max(60, "Imię może mieć maksymalnie 60 znaków"),
    email: z
      .string()
      .min(1, "Email jest wymagany")
      .email("Podaj prawidłowy adres email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
