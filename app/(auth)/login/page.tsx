import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Logowanie — Bajkowy Świat",
};

// Strona logowania — formularz email + hasło, link do rejestracji
export default function LoginPage() {
  return <LoginForm />;
}
