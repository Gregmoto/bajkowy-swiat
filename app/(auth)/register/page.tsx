import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Rejestracja — Bajkowy Świat",
};

// Strona rejestracji — imię, email, hasło, zgody
export default function RegisterPage() {
  return <RegisterForm />;
}
