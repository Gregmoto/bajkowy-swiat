import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resetowanie hasła — Bajkowy Świat",
};

// Resetowanie hasła — wysyła link na email
export default function ForgotPasswordPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-bold">Resetowanie hasła</h1>
      <p className="text-muted-foreground">
        Podaj swój adres e-mail, a wyślemy Ci link do zresetowania hasła.
      </p>
      {/* TODO: ForgotPasswordForm */}
    </div>
  );
}
